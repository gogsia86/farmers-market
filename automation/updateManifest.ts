import path from 'path';
import { ProgressTracker } from './progressTracker';

async function updateManifest() {
  // Initialize trackers
  const manifestTracker = new ProgressTracker(
    path.join(process.cwd(), 'automation/DIVINE_TODO_MANIFEST.md')
  );
  const progressTracker = new ProgressTracker(
    path.join(process.cwd(), 'automation/PROGRESS_TRACKER.md')
  );

  await manifestTracker.init();
  await progressTracker.init();

  // Get current tasks from manifest
  const manifestTasks = await manifestTracker.getAllTasks();
  const metrics = manifestTracker.calculateMetrics(manifestTasks);

  // Update progress tracker
  await progressTracker.updateMetrics(manifestTasks);
  await progressTracker.addActivityLog(
    `Updated manifest metrics - Progress: ${metrics.overallProgress.toFixed(1)}%, ` +
    `Quantum Resonance: ${metrics.quantumMetrics.resonance.toFixed(2)}`
  );

  // Save updates
  await progressTracker.save();
  await manifestTracker.save();

  console.log('Manifest and progress tracker updated successfully');
  console.log(`Overall Progress: ${metrics.overallProgress.toFixed(1)}%`);
  console.log(`Quantum Resonance: ${metrics.quantumMetrics.resonance.toFixed(2)}`);
  console.log(`Dimensional Alignment: ${metrics.quantumMetrics.dimensionalAlignment ? 'Achieved' : 'In Progress'}`);
}

if (require.main === module) {
  updateManifest().catch(console.error);
}

export { updateManifest };