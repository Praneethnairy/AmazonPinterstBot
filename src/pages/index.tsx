import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Shield, Bot, Zap, Lock, Globe } from 'lucide-react';
import { apiClient, Credentials, defaultAutomationConfig, categoryOptions } from '@/lib/api';

interface FormValues {
  pinterest_token: string;
  amazon_tag: string;
  session_password: string;
  categories: string[];
  max_products_per_category: number;
  post_interval_seconds: number;
  daily_pin_limit: number;
  min_rating: number;
  min_reviews: number;
  price_range_min: number;
  price_range_max: number;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      categories: defaultAutomationConfig.categories,
      max_products_per_category: defaultAutomationConfig.max_products_per_category,
      post_interval_seconds: defaultAutomationConfig.post_interval_seconds,
      daily_pin_limit: defaultAutomationConfig.daily_pin_limit,
      min_rating: defaultAutomationConfig.min_rating,
      min_reviews: defaultAutomationConfig.min_reviews,
      price_range_min: defaultAutomationConfig.price_range_min,
      price_range_max: defaultAutomationConfig.price_range_max,
    }
  });

  const selectedCategories = watch('categories');

  useEffect(() => {
    // Check if already authenticated
    if (apiClient.isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    try {
      const credentials: Credentials = {
        pinterest_token: data.pinterest_token,
        amazon_tag: data.amazon_tag,
        session_password: data.session_password,
      };

      const config = {
        categories: data.categories,
        max_products_per_category: data.max_products_per_category,
        post_interval_seconds: data.post_interval_seconds,
        daily_pin_limit: data.daily_pin_limit,
        min_rating: data.min_rating,
        min_reviews: data.min_reviews,
        price_range_min: data.price_range_min,
        price_range_max: data.price_range_max,
      };

      // Start session
      const sessionResponse = await apiClient.startSession(credentials);
      toast.success(`Session started! Found ${sessionResponse.pinterest_boards.length} Pinterest boards`);

      // Start automation
      const automationResponse = await apiClient.startAutomation({ credentials, config });
      toast.success(`Automation started! Job ID: ${automationResponse.job_id}`);

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);

    } catch (error: any) {
      toast.error(error.message || 'Failed to start automation');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    const current = selectedCategories || [];
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    setValue('categories', updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900">Amazon Pinterest Bot</h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/privacy-policy" className="text-gray-600 hover:text-gray-900">
                Privacy Policy
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="py-12">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Automate Your Amazon Affiliate Marketing
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Automatically find trending Amazon products and create engaging Pinterest pins with affiliate links. 
            End-to-end encrypted and secure.
          </p>
          
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <Zap className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Automated Discovery</h3>
              <p className="text-gray-600">Finds trending products from Amazon best sellers and new releases</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">End-to-End Encrypted</h3>
              <p className="text-gray-600">Your credentials are encrypted and never stored in plain text</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Pinterest Integration</h3>
              <p className="text-gray-600">Creates optimized pins with engaging content and proper disclosures</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-2xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Lock className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-2xl font-bold text-gray-900">Start Secure Session</h3>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Credentials Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-700 border-b pb-2">API Credentials</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pinterest Access Token
                </label>
                <input
                  type="text"
                  placeholder="Enter your Pinterest API access token"
                  {...register('pinterest_token', { required: 'Pinterest token is required' })}
                  className="input"
                />
                {errors.pinterest_token && (
                  <p className="text-red-500 text-sm mt-1">{errors.pinterest_token.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Get your token from <a href="https://developers.pinterest.com/" target="_blank" className="text-primary-600 hover:underline">Pinterest Developers</a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amazon Associate Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g., yourname-20"
                  {...register('amazon_tag', { required: 'Amazon associate tag is required' })}
                  className="input"
                />
                {errors.amazon_tag && (
                  <p className="text-red-500 text-sm mt-1">{errors.amazon_tag.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Your Amazon Associates affiliate tag
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Password
                </label>
                <input
                  type="password"
                  placeholder="Secure password for encryption"
                  {...register('session_password', { 
                    required: 'Session password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' }
                  })}
                  className="input"
                />
                {errors.session_password && (
                  <p className="text-red-500 text-sm mt-1">{errors.session_password.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Used to encrypt your credentials. Choose a strong password.
                </p>
              </div>
            </div>

            {/* Categories Section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Product Categories</h4>
              <div className="grid grid-cols-2 gap-3">
                {categoryOptions.map(({ value, label }) => (
                  <label key={value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories?.includes(value) || false}
                      onChange={() => toggleCategory(value)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Advanced Settings */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                {showAdvanced ? '▼ Hide' : '▶ Show'} Advanced Settings
              </button>
              
              {showAdvanced && (
                <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Products per Category
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        {...register('max_products_per_category', { valueAsNumber: true })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Post Interval (seconds)
                      </label>
                      <input
                        type="number"
                        min="60"
                        {...register('post_interval_seconds', { valueAsNumber: true })}
                        className="input"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Rating
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        {...register('min_rating', { valueAsNumber: true })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Reviews
                      </label>
                      <input
                        type="number"
                        min="0"
                        {...register('min_reviews', { valueAsNumber: true })}
                        className="input"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Price ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        {...register('price_range_min', { valueAsNumber: true })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Price ($)
                      </label>
                      <input
                        type="number"
                        min="1"
                        {...register('price_range_max', { valueAsNumber: true })}
                        className="input"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading || !selectedCategories?.length}
                className={`w-full btn-primary py-3 text-base font-semibold ${
                  loading || !selectedCategories?.length ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting Automation...
                  </span>
                ) : (
                  '🚀 Start Automation'
                )}
              </button>
              
              {!selectedCategories?.length && (
                <p className="text-red-500 text-sm mt-2 text-center">Please select at least one category</p>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">🔒 Your data is encrypted end-to-end and never stored permanently</p>
            <p className="text-sm">
              By using this service, you agree to our{' '}
              <Link href="/privacy-policy" className="text-primary-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
