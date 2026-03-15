<template>
  <div class="dashboard">
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-left">
           <img src="/logo.png" alt="AUCA Logo" class="nav-logo" />
           <h1>AUCA JobLink - Student Dashboard</h1>
        </div>
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </nav>

    <div class="container">
      <div class="tabs">
        <button @click="activeTab = 'available'" :class="{active: activeTab === 'available'}">Available Jobs</button>
        <button @click="activeTab = 'applied'" :class="{active: activeTab === 'applied'}">My Applications</button>
      </div>

      <div class="content">
        <!-- Available Jobs Tab -->
        <div v-if="activeTab === 'available'" class="tab-content">
          <!-- Search Section -->
          <div class="section search-section">
            <h2>Search Jobs</h2>
            <input 
              v-model="searchQuery" 
              placeholder="Search by title, company, or location..."
              class="search-input"
            />
          </div>

          <!-- Available Jobs Section -->
          <div class="section">
            <h2>Available Jobs ({{ filteredJobs.length }})</h2>
            <p v-if="applyError" class="apply-error">{{ applyError }}</p>
            <div v-if="jobStore.loading" class="loading">Loading jobs...</div>
            <div v-else-if="filteredJobs.length === 0" class="no-jobs">
              No jobs available at the moment.
            </div>
            <div v-else class="jobs-grid">
              <div v-for="job in filteredJobs" :key="job._id" class="job-container">
                <JobCard 
                  :job="job"
                  :show-delete="false"
                  :show-apply="true"
                  :applied-jobs="appliedJobIds"
                  @apply="handleApply"
                />
                
                <!-- Apply Modal with Transcript Upload -->
                <div v-if="applyingTo === job._id" class="apply-overlay" @click.self="applyingTo = null">
                  <div class="apply-modal">
                    <h3>Apply for {{ job.title }}</h3>
                    <p class="company">{{ job.company }}</p>
                    
                    <div class="upload-section">
                      <label>Upload Your Transcript (PDF or Image)</label>
                      <input type="file" @change="onFileChange" accept=".pdf,image/*" class="file-input" />
                      <p v-if="selectedFileName" class="file-name">📎 Selected: {{ selectedFileName }}</p>
                      <p v-if="fileError" class="error-text">{{ fileError }}</p>
                    </div>

                    <div class="modal-actions">
                      <button @click="submitApplication" :disabled="submitting || !selectedFileBase64" class="confirm-btn">
                        {{ submitting ? 'Submitting...' : 'Confirm Application' }}
                      </button>
                      <button @click="applyingTo = null" class="cancel-btn">Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- My Applications Tab -->
        <div v-if="activeTab === 'applied'" class="tab-content">
          <div class="section">
            <h2>My Applications ({{ appliedJobsFull.length }})</h2>
            <div v-if="loadingApplied" class="loading">Loading your applications...</div>
            <div v-else-if="appliedJobsFull.length === 0" class="no-jobs">
              You haven't applied for any jobs yet.
            </div>
            <div v-else class="jobs-grid">
              <JobCard 
                v-for="job in appliedJobsFull" 
                :key="job._id"
                :job="job"
                :show-delete="false"
                :show-apply="true"
                :applied-jobs="appliedJobIds"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useJobStore } from '../stores/jobStore';
import JobCard from '../components/JobCard.vue';

const router = useRouter();
const authStore = useAuthStore();
const jobStore = useJobStore();

const activeTab = ref('available');
const searchQuery = ref('');
const appliedJobIds = ref([]);
const appliedJobsFull = ref([]);
const loadingApplied = ref(false);

// Application State
const applyingTo = ref(null);
const selectedFileName = ref('');
const selectedFileBase64 = ref('');
const submitting = ref(false);
const fileError = ref('');

const onFileChange = (e) => {
  const file = e.target.files[0];
  fileError.value = '';
  if (!file) return;
  
  if (file.size > 5 * 1024 * 1024) {
    fileError.value = 'File size must be under 5MB';
    return;
  }

  selectedFileName.value = file.name;
  const reader = new FileReader();
  reader.onload = () => {
    selectedFileBase64.value = reader.result;
  };
  reader.onerror = () => {
    fileError.value = 'Failed to read file';
  };
  reader.readAsDataURL(file);
};

const filteredJobs = computed(() => {
  if (!searchQuery.value) {
    return jobStore.jobs;
  }
  
  const query = searchQuery.value.toLowerCase();
  return jobStore.jobs.filter(job => 
    job.title.toLowerCase().includes(query) ||
    job.company.toLowerCase().includes(query) ||
    job.location.toLowerCase().includes(query)
  );
});

const fetchAppliedData = async () => {
  try {
    loadingApplied.value = true;
    const token = localStorage.getItem('token');
    if (!token) return;
    const applied = await jobStore.fetchAppliedJobs(token);
    appliedJobsFull.value = applied;
    appliedJobIds.value = applied.map(job => job._id);
  } catch (err) {
    console.error('Failed to fetch applied jobs:', err);
  } finally {
    loadingApplied.value = false;
  }
};

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/');
  }
  await jobStore.fetchJobs();
  await fetchAppliedData();
});

// Re-fetch when switching to applied tab to ensure up-to-date info
watch(activeTab, (newTab) => {
  if (newTab === 'applied') {
    fetchAppliedData();
  }
});

const handleLogout = () => {
  authStore.logout();
  router.push('/');
};

const applyError = ref('');

const handleApply = (job) => {
  applyingTo.value = job._id;
  selectedFileName.value = '';
  selectedFileBase64.value = '';
  fileError.value = '';
};

const submitApplication = async () => {
  if (!selectedFileBase64.value) {
    fileError.value = 'Please select a transcript file';
    return;
  }
  
  try {
    submitting.value = true;
    const token = localStorage.getItem('token');
    await jobStore.applyToJob(applyingTo.value, token, selectedFileBase64.value);
    
    appliedJobIds.value.push(applyingTo.value);
    applyingTo.value = null;
    fetchAppliedData();
  } catch (err) {
    fileError.value = err.response?.data?.message || 'Failed to apply';
  } finally {
    submitting.value = false;
  }
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

.nav-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.nav-logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
  filter: brightness(0) invert(1);
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

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
}

.tabs button {
  padding: 10px 25px;
  background: white;
  border: 2px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s;
}

.tabs button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
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

.search-section {
  margin-bottom: 10px;
}

.search-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 5px rgba(102, 126, 234, 0.3);
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

/* Apply Modal Styles */
.apply-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.apply-modal {
  background: white;
  padding: 30px;
  border-radius: 10px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.apply-modal h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.apply-modal .company {
  color: #667eea;
  font-weight: 600;
  margin-bottom: 20px;
}

.upload-section {
  margin: 20px 0;
  padding: 20px;
  background: #f8f9fa;
  border: 2px dashed #ddd;
  border-radius: 8px;
  text-align: center;
}

.upload-section label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #555;
}

.file-input {
  width: 100%;
  margin-bottom: 10px;
}

.file-name {
  color: #27ae60;
  font-weight: 500;
  font-size: 14px;
}

.error-text {
  color: #e74c3c;
  font-size: 13px;
  margin-top: 10px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 25px;
}

.confirm-btn {
  flex: 2;
  background: #667eea;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.confirm-btn:hover:not(:disabled) {
  background: #5568d3;
}

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  flex: 1;
  background: #eee;
  color: #666;
  border: none;
  padding: 12px;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
}
</style>
