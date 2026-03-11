<template>
  <div class="job-form">
    <h3>{{ title }}</h3>
    <div v-if="error" class="alert error">{{ error }}</div>
    <div v-if="success" class="alert success">{{ success }}</div>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Job Title</label>
        <input v-model="formData.title" placeholder="e.g., Senior Developer" required />
      </div>

      <div class="form-group">
        <label>Company</label>
        <input v-model="formData.company" placeholder="e.g., Tech Corp" required />
      </div>

      <div class="form-group">
        <label>Location</label>
        <input v-model="formData.location" placeholder="e.g., New York, NY" required />
      </div>

      <div class="form-group">
        <label>Description</label>
        <textarea v-model="formData.description" placeholder="Job description..." rows="6" required></textarea>
      </div>

      <div class="form-group">
        <label>Salary (Optional)</label>
        <input v-model="formData.salary" placeholder="e.g., $100k - $150k" />
      </div>

      <button type="submit" class="submit-btn" :disabled="loading">
        {{ loading ? 'Loading...' : 'Post Job' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  title: {
    type: String,
    default: 'Post a New Job'
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit']);

const formData = ref({
  title: '',
  company: '',
  location: '',
  description: '',
  salary: ''
});

const error = ref('');
const success = ref('');

const handleSubmit = () => {
  error.value = '';
  success.value = '';
  emit('submit', formData.value);
};

const setSuccess = (msg) => {
  success.value = msg;
  formData.value = { title: '', company: '', location: '', description: '', salary: '' };
};

const setError = (msg) => {
  error.value = msg;
};

defineExpose({ setSuccess, setError });
</script>

<style scoped>
.job-form {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.job-form h3 {
  margin-top: 0;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
}

.submit-btn {
  background: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
}

.submit-btn:hover:not(:disabled) {
  background: #45a049;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.alert {
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 14px;
}

.alert.error {
  background: #ffebee;
  color: #c62828;
  border-left: 4px solid #c62828;
}

.alert.success {
  background: #e8f5e9;
  color: #2e7d32;
  border-left: 4px solid #2e7d32;
}
</style>
