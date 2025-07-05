import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Bot,
  Play,
  Pause,
  Square,
  RefreshCw,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  LogOut,
  Activity
} from 'lucide-react';
import { apiClient, JobStatus, formatJobStatus, getStatusColor } from '@/lib/api';

export default function Dashboard() {
  const [jobs, setJobs] = useState<JobStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    if (!apiClient.isAuthenticated()) {
      router.push('/');
      return;
    }

    loadJobs();
    
    // Set up auto-refresh
    const interval = setInterval(loadJobs, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(interval);
  }, [router]);

  const loadJobs = async () => {
    try {
      const userJobs = await apiClient.getUserJobs();
      setJobs(userJobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (error: any) {
      if (!error.message.includes('401')) {
        toast.error('Failed to load jobs');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      await apiClient.cancelJob(jobId);
      toast.success('Job cancelled successfully');
      await loadJobs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel job');
    }
  };

  const handleEndSession = async () => {
    try {
      await apiClient.endSession();
      toast.success('Session ended successfully');
      router.push('/');
    } catch (error: any) {
      toast.error('Failed to end session');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4" />;
      case 'running':
        return <Activity className="h-4 w-4 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'cancelled':
        return <Square className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateOverallStats = () => {
    const totalJobs = jobs.length;
    const completedJobs = jobs.filter(job => job.status === 'completed').length;
    const runningJobs = jobs.filter(job => job.status === 'running').length;
    const failedJobs = jobs.filter(job => job.status === 'failed').length;
    
    const totalPinsCreated = jobs
      .filter(job => job.results)
      .reduce((sum, job) => sum + (job.results?.total_pins_created || 0), 0);
    
    const totalProductsFound = jobs
      .filter(job => job.results)
      .reduce((sum, job) => sum + (job.results?.total_products_found || 0), 0);

    return {
      totalJobs,
      completedJobs,
      runningJobs,
      failedJobs,
      totalPinsCreated,
      totalProductsFound
    };
  };

  const stats = calculateOverallStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900">Automation Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-outline p-2"
                title="Refresh"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <Link href="/privacy-policy" className="text-gray-600 hover:text-gray-900">
                Privacy
              </Link>
              <button
                onClick={handleEndSession}
                className="btn-danger p-2"
                title="End Session"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pins Created</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPinsCreated}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Products Found</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProductsFound}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Play className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Running Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.runningJobs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Automation Jobs</h2>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No automation jobs found</p>
              <Link href="/" className="btn-primary mt-4">
                Start New Automation
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Results
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job.job_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {job.job_id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(job.status)}
                          <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                            {formatJobStatus(job.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {job.status === 'running' && job.progress ? (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Overall Progress</span>
                              <span>{Math.round(job.progress.overall_progress || 0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${job.progress.overall_progress || 0}%` }}
                              ></div>
                            </div>
                            {job.progress.current_category && (
                              <p className="text-xs text-gray-600">
                                Processing: {job.progress.current_category}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.results ? (
                          <div className="space-y-1">
                            <div>📌 {job.results.total_pins_created} pins</div>
                            <div>🔍 {job.results.total_products_found} products</div>
                            {job.results.total_errors > 0 && (
                              <div className="text-red-600">❌ {job.results.total_errors} errors</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(job.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {job.status === 'running' || job.status === 'queued' ? (
                          <button
                            onClick={() => handleCancelJob(job.job_id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center">
          <Link href="/" className="btn-primary">
            🚀 Start New Automation
          </Link>
        </div>
      </div>
    </div>
  );
}
