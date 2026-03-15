<template>
  <div class="admin-dashboard">
    <nav class="navbar">
      <div class="nav-content">
        <div class="nav-left">
          <img src="/logo.png" alt="AUCA Logo" class="nav-logo" />
          <h1>Admin Dashboard</h1>
        </div>
        <button @click="logout" class="logout-btn">Logout</button>
      </div>
    </nav>

    <div class="container">
      <div class="tabs">
        <button @click="activeTab = 'companies'" :class="{active: activeTab === 'companies'}">Companies</button>
        <button @click="activeTab = 'jobs'" :class="{active: activeTab === 'jobs'}">Job Opportunities</button>
      </div>

      <!-- Companies Tab -->
      <div v-if="activeTab === 'companies'" class="tab-content">
        <div class="section">
          <h2>Add Company</h2>
          <div class="form-card">
            <p v-if="companySuccess" class="success">{{ companySuccess }}</p>
            <p v-if="companyError" class="error">{{ companyError }}</p>
            <input v-model="newCompany" placeholder="Company Name" />
            <button @click="addCompany" class="add-btn">Add Company</button>
          </div>
        </div>

        <div class="section">
          <h2>Companies List</h2>
          <div class="companies-list">
            <div v-for="(company, index) in companies" :key="index" class="company-item">
              <span>{{ company }}</span>
              <button @click="deleteCompany(index)" class="delete-btn">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Jobs Tab -->
      <div v-if="activeTab === 'jobs'" class="tab-content">
        <div class="section">
          <h2>{{ isEditing ? 'Edit Job Opportunity' : 'Post Job Opportunity' }}</h2>
          <div class="form-card">
            <p v-if="jobSuccess" class="success">{{ jobSuccess }}</p>
            <p v-if="jobError" class="error">{{ jobError }}</p>
            <input v-model="jobTitle" placeholder="Job Title" />
            <div class="form-row">
              <select v-model="jobCompany">
                <option value="">Select Company</option>
                <option v-for="(company, index) in companies" :key="index" :value="company">{{ company }}</option>
              </select>
              <input v-model="jobLocation" placeholder="Location (e.g., Kigali, Rwanda)" />
            </div>
            <div class="form-row">
              <input v-model="jobSalary" placeholder="Salary (e.g., $800 - $1,200/month)" />
              <select v-model="jobType">
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <input v-model="jobSkills" placeholder="Required Skills (comma separated: e.g. React, Node.js, CSS)" />
            <input v-model="jobRequirements" placeholder="Other Requirements (comma separated)" />
            <textarea v-model="jobDescription" placeholder="Job Description" rows="6"></textarea>
            
            <div class="form-actions">
              <button @click="isEditing ? updateJob() : postJob()" class="post-btn">
                {{ isEditing ? 'Update Job' : 'Post Job' }}
              </button>
              <button v-if="isEditing" @click="cancelEdit" class="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Posted Jobs</h2>
          <div v-if="loading" class="loading">Loading...</div>
          <div v-else class="jobs-list">
            <div v-for="job in jobs" :key="job._id" class="job-item">
              <div class="job-info">
                <div class="job-header">
                   <h3>{{ job.title }}</h3>
                   <span class="applicant-badge">{{ job.applicants?.length || 0 }} Applicants</span>
                </div>
                <p class="company">{{ job.company }}</p>
                <p class="location">📍 {{ job.location }}</p>
                <p class="desc">{{ job.description }}</p>
                <div v-if="job.skills?.length" class="skills-preview">
                   <span v-for="skill in job.skills" :key="skill" class="skill-tag">{{ skill }}</span>
                </div>
              </div>
              <div class="job-actions">
                <button @click="viewApplicants(job)" class="view-btn">Applicants</button>
                <button @click="editJob(job)" class="edit-btn">Edit</button>
                <button @click="deleteJob(job._id)" class="delete-btn">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Applicants Modal -->
    <div v-if="showApplicantsModal" class="modal-overlay" @click.self="showApplicantsModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Applicants for {{ selectedJob?.title }}</h2>
          <button @click="showApplicantsModal = false" class="close-btn">&times;</button>
        </div>
        <div class="applicants-list">
          <div v-if="fetchingApplicants" class="modal-loading">Loading applicants...</div>
          <div v-else-if="selectedApplicants.length === 0" class="no-data">No applicants yet.</div>
          <div v-else v-for="app in selectedApplicants" :key="app.user?._id" class="applicant-item">
            <div class="applicant-info">
              <strong>{{ app.user?.name || 'Unknown' }}</strong>
              <span>{{ app.user?.email || 'N/A' }}</span>
              <div v-if="app.transcript" class="transcript-link">
                <a @click.prevent="viewTranscript(app.transcript)" href="#">📄 View Transcript</a>
              </div>
              <span v-else class="no-transcript">No transcript uploaded</span>
            </div>
            <span class="applied-date">{{ new Date(app.appliedAt).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useJobStore } from '../stores/jobStore';

export default {
  data() {
    return {
      activeTab: "companies",
      companies: ["Google", "Microsoft", "Amazon", "Apple", "Meta", "AC Group Ltd", "Irembo"],
      newCompany: "",
      companySuccess: "",
      companyError: "",
      
      // Job Form
      jobTitle: "",
      jobCompany: "",
      jobLocation: "Kigali, Rwanda",
      jobSalary: "",
      jobType: "full-time",
      jobSkills: "",
      jobRequirements: "",
      jobDescription: "",
      
      jobs: [],
      loading: false,
      jobSuccess: "",
      jobError: "",
      
      // Editing
      isEditing: false,
      editingId: null,
      
      // Applicants Modal
      showApplicantsModal: false,
      selectedJob: null,
      selectedApplicants: [],
      fetchingApplicants: false
    };
  },
  async mounted() {
    await this.fetchJobs();
  },
  methods: {
    addCompany() {
      if (!this.newCompany.trim()) {
        this.companyError = "Company name required";
        return;
      }
      this.companies.push(this.newCompany);
      this.companySuccess = "Company added successfully!";
      this.newCompany = "";
      setTimeout(() => this.companySuccess = "", 3000);
    },
    deleteCompany(index) {
      if (confirm("Delete this company?")) {
        this.companies.splice(index, 1);
      }
    },
    async postJob() {
      try {
        this.jobError = "";
        this.jobSuccess = "";
        
        if (!this.jobTitle || !this.jobCompany || !this.jobDescription) {
          this.jobError = "Title, Company and Description are required";
          return;
        }

        const skills = this.jobSkills ? this.jobSkills.split(',').map(s => s.trim()) : [];
        const requirements = this.jobRequirements ? this.jobRequirements.split(',').map(s => s.trim()) : [];

        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/jobs`,
          {
            title: this.jobTitle,
            company: this.jobCompany,
            location: this.jobLocation,
            salary: this.jobSalary,
            jobType: this.jobType,
            description: this.jobDescription,
            skills,
            requirements
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        
        this.jobSuccess = "Job posted successfully!";
        this.resetForm();
        await this.fetchJobs();
      } catch (err) {
        this.jobError = err.response?.data?.message || "Failed to post job";
      }
    },
    async updateJob() {
      try {
        this.jobError = "";
        this.jobSuccess = "";

        const skills = this.jobSkills ? this.jobSkills.split(',').map(s => s.trim()) : [];
        const requirements = this.jobRequirements ? this.jobRequirements.split(',').map(s => s.trim()) : [];

        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/jobs/${this.editingId}`,
          {
            title: this.jobTitle,
            company: this.jobCompany,
            location: this.jobLocation,
            salary: this.jobSalary,
            jobType: this.jobType,
            description: this.jobDescription,
            skills,
            requirements
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        this.jobSuccess = "Job updated successfully!";
        this.isEditing = false;
        this.editingId = null;
        this.resetForm();
        await this.fetchJobs();
      } catch (err) {
        this.jobError = err.response?.data?.message || "Failed to update job";
      }
    },
    editJob(job) {
      this.isEditing = true;
      this.editingId = job._id;
      this.jobTitle = job.title;
      this.jobCompany = job.company;
      this.jobLocation = job.location;
      this.jobSalary = job.salary || "";
      this.jobType = job.jobType || "full-time";
      this.jobSkills = job.skills ? job.skills.join(', ') : "";
      this.jobRequirements = job.requirements ? job.requirements.join(', ') : "";
      this.jobDescription = job.description;
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    cancelEdit() {
      this.isEditing = false;
      this.editingId = null;
      this.resetForm();
    },
    resetForm() {
      this.jobTitle = "";
      this.jobCompany = "";
      this.jobLocation = "Kigali, Rwanda";
      this.jobSalary = "";
      this.jobType = "full-time";
      this.jobSkills = "";
      this.jobRequirements = "";
      this.jobDescription = "";
    },
    async fetchJobs() {
      try {
        this.loading = true;
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs`);
        this.jobs = res.data;
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async viewApplicants(job) {
      this.selectedJob = job;
      this.showApplicantsModal = true;
      this.fetchingApplicants = true;
      this.selectedApplicants = [];
      
      try {
        const jobStore = useJobStore();
        const data = await jobStore.fetchApplicants(job._id, localStorage.getItem("token"));
        this.selectedApplicants = data;
      } catch (err) {
        console.error("Failed to fetch applicants:", err);
      } finally {
        this.fetchingApplicants = false;
      }
    },
    viewTranscript(base64Data) {
      const win = window.open();
      win.document.write('<iframe src="' + base64Data + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
    },
    async deleteJob(id) {
      if (confirm("Delete this job?")) {
        try {
          await axios.delete(`${import.meta.env.VITE_API_URL}/api/jobs/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          });
          await this.fetchJobs();
        } catch (err) {
          alert("Failed to delete");
        }
      }
    },
    logout() {
      localStorage.clear();
      this.$router.push("/admin-login");
    }
  }
};
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: #f5f7fa;
}

.navbar {
  background: #2c3e50;
  padding: 15px 0;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.nav-logo {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.navbar h1 {
  font-size: 24px;
  color: white;
}

.logout-btn {
  padding: 8px 20px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.logout-btn:hover {
  background: #c0392b;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.tabs button {
  padding: 12px 30px;
  background: white;
  border: 2px solid #ddd;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
}

.tabs button.active {
  background: #2c3e50;
  color: white;
  border-color: #2c3e50;
}

.section {
  margin-bottom: 40px;
}

.section h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.form-card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

input, select, textarea {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.add-btn, .post-btn {
  flex: 2;
  padding: 12px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  font-weight: 600;
}

.cancel-btn {
  flex: 1;
  padding: 12px;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  font-weight: 600;
}

.add-btn:hover, .post-btn:hover {
  background: #229954;
}

.success {
  color: #27ae60;
  background: #d5f4e6;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  text-align: center;
}

.error {
  color: #e74c3c;
  background: #fadbd8;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  text-align: center;
}

.companies-list, .jobs-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.company-item, .job-item {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.job-info {
  flex: 1;
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.job-info h3 {
  font-size: 18px;
  margin: 0;
}

.applicant-badge {
  background: #e67e22;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.company {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 5px;
}

.location {
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 10px;
}

.desc {
  color: #666;
  line-height: 1.5;
  margin-bottom: 15px;
}

.skills-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  background: #f0f2f5;
  color: #476282;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 500;
}

.job-actions {
  display: flex;
  gap: 8px;
}

.view-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
}

.edit-btn {
  background: #f1c40f;
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
}

.delete-btn {
  padding: 8px 16px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* Modal Styles */
.modal-overlay {
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

.modal-content {
  background: white;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.applicants-list {
  padding: 20px;
  overflow-y: auto;
}

.applicant-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f9f9f9;
}

.applicant-info {
  display: flex;
  flex-direction: column;
}

.applicant-info strong {
  color: #333;
}

.applicant-info span {
  color: #777;
  font-size: 13px;
}

.transcript-link {
  margin-top: 5px;
}

.transcript-link a {
  color: #3498db;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.transcript-link a:hover {
  text-decoration: underline;
}

.no-transcript {
  color: #999 !important;
  font-size: 12px !important;
  margin-top: 5px;
  font-style: italic;
}

.applied-date {
  font-size: 12px;
  color: #999;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

