import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export const useJobStore = defineStore('jobs', () => {
  const jobs = ref([]);
  const loading = ref(false);

  const fetchJobs = async () => {
    loading.value = true;
    try {
      const res = await axios.get('http://localhost:5000/api/jobs');
      jobs.value = res.data;
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      loading.value = false;
    }
  };

  const createJob = async (jobData, token) => {
    try {
      const res = await axios.post('http://localhost:5000/api/jobs', jobData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      jobs.value.push(res.data);
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  const deleteJob = async (jobId, token) => {
    try {
      await axios.delete(`http://localhost:5000/api/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      jobs.value = jobs.value.filter(job => job._id !== jobId);
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  const updateJob = async (jobId, jobData, token) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/jobs/${jobId}`, jobData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const index = jobs.value.findIndex(job => job._id === jobId);
      if (index > -1) {
        jobs.value[index] = res.data;
      }
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  };

  return {
    jobs,
    loading,
    fetchJobs,
    createJob,
    deleteJob,
    updateJob
  };
});
