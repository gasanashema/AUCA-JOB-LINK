arouter.post('/:id/apply', auth, async (req,res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({message:'Job not found'});
  // prevent duplicate
  if (job.applicants?.some(a => a.user.toString() === req.user.id)) {
     return res.status(400).json({message:'Already applied'});
  }
  job.applicants = job.applicants || [];
  job.applicants.push({ user: req.user.id, appliedAt: new Date() });
  await job.save();
  res.json({message:'Applied'});
});