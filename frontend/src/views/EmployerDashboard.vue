<template>
  <div class="dashboard">
    <nav class="navbar">
      <div class="nav-container">
        <h1>👔 AUCA JobLink - Employer Dashboard</h1>
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </nav>

    <div class="container">
      <div class="content">
        <!-- Post Job Section -->
        <div class="section">
          <JobForm 
            title="Post a New Job"
            :loading="postingJob"
            @submit="submitJob"
            ref="jobFormRef"
          />
        </div>

        <!-- Posted Jobs Section -->
        <div class="section">
          <h2>Your Posted Jobs</h2>
          <div v-if="jobStore.loading" class="loading">Loading jobs...</div>
          <div v-else-if="jobStore.jobs.length === 0" class="no-jobs">
            No jobs posted yet. Create one above!
          </div>
          <div v-else class="jobs-grid">
            <JobCard 
              v-for="job in jobStore.jobs" 
              :key="job._id"
              :job="job"
              :show-delete="true"
              @delete="deleteJob"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useJobStore } from '../stores/jobStore';
import JobForm from '../components/JobForm.vue';
import JobCard from '../components/JobCard.vue';

const router = useRouter();
const authStore = useAuthStore();
const jobStore = useJobStore();

const postingJob = ref(false);
const jobFormRef = ref(null);

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/');
  }
  await jobStore.fetchJobs();
});

const submitJob = async (formData) => {
  postingJob.value = true;
  try {
    await jobStore.createJob(formData, authStore.token);
    jobFormRef.value?.setSuccess('Job posted successfully!');
    await jobStore.fetchJobs();
  } catch (err) {
    jobFormRef.value?.setError(err.message || 'Failed to post job');
  } finally {
    postingJob.value = false;
  }
};

const deleteJob = async (jobId) => {
  try {
    await jobStore.deleteJob(jobId, authStore.token);
    await jobStore.fetchJobs();
  } catch (err) {
    alert('Failed to delete job');
  }
};

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f5f5f5;
}

.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.navbar h1 {
  margin: 0;
  font-size: 24px;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.logout-btn:hover {
  background: white;
  color: #667eea;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.content {
  display: grid;
  gap: 30px;
}

.section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.section h2 {
  color: #333;
  margin-top: 0;
}

.loading,
.no-jobs {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 16px;
}

.jobs-grid {
  display: grid;
  gap: 20px;
}
</style>
