'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CURRENT_USER } from '@/graphql/auth';
import { gql } from '@apollo/client';
import { toast } from 'sonner';
import { UserCircle, Mail, Phone, MapPin, Building2, Shield, ChevronRight, Bell, Key, Lock, CreditCard } from 'lucide-react';
import { ModeToggle } from '@/components/ModeToggle';

const UPDATE_USER = gql`
  mutation UpdateUser($id: String!, $input: UserUpdateInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      phone
      address
      agency
      roles
    }
  }
`;

export default function ProfilePage() {
  const { data, loading, error } = useQuery(GET_CURRENT_USER);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    agency: ''
  });

  const [updateUser] = useMutation(UPDATE_USER, {
    onCompleted: () => {
      toast.success('Profile updated successfully');
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile');
    }
  });

  useEffect(() => {
    if (data?.currentUser) {
      setFormData({
        name: data.currentUser.name || '',
        email: data.currentUser.email || '',
        phone: data.currentUser.phone || '',
        address: data.currentUser.address || '',
        agency: data.currentUser.agency || ''
      });
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-red-500">Error loading profile: {error.message}</div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({
        variables: {
          id: data.currentUser.id,
          input: {
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            agency: formData.agency
          }
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'security', label: 'Security' },
    { id: 'billing', label: 'Billing' },
    { id: 'notifications', label: 'Notifications' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <div className="relative h-48 bg-gradient-custom">
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
          <ModeToggle />
        </div>
        <div className="absolute -bottom-16 left-8 sm:left-12 flex items-end gap-6">
          <div className="bg-background rounded-full p-1">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-background bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
              <UserCircle className="w-16 h-16 sm:w-20 sm:h-20 text-primary" />
            </div>
          </div>
          <div className="mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{data.currentUser.name}</h1>
            <p className="text-foreground/80">{data.currentUser.email}</p>
          </div>
        </div>

      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Active Services</div>
            <div className="text-2xl font-semibold text-foreground mt-1">3</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Total Bandwidth</div>
            <div className="text-2xl font-semibold text-foreground mt-1">50 Mbps</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Account Status</div>
            <div className="text-2xl font-semibold text-green-500 mt-1">Active</div>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <div className="text-sm text-muted-foreground">Member Since</div>
            <div className="text-2xl font-semibold text-foreground mt-1">2023</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b mb-8">
          <div className="flex gap-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card rounded-lg border">
              <div className="p-6 flex justify-between items-center border-b">
                <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-primary hover:underline text-sm font-medium"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-10 p-2 rounded-md border bg-background text-foreground disabled:opacity-50"
                      />
                      <UserCircle className="w-5 h-5 absolute left-3 top-2.5 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled={true}
                        className="w-full pl-10 p-2 rounded-md border bg-background text-foreground disabled:opacity-50"
                      />
                      <Mail className="w-5 h-5 absolute left-3 top-2.5 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-10 p-2 rounded-md border bg-background text-foreground disabled:opacity-50"
                      />
                      <Phone className="w-5 h-5 absolute left-3 top-2.5 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-10 p-2 rounded-md border bg-background text-foreground disabled:opacity-50"
                      />
                      <MapPin className="w-5 h-5 absolute left-3 top-2.5 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Agency</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="agency"
                        value={formData.agency}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full pl-10 p-2 rounded-md border bg-background text-foreground disabled:opacity-50"
                      />
                      <Building2 className="w-5 h-5 absolute left-3 top-2.5 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end mt-6">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-custom text-white rounded-md hover:opacity-90 transition-opacity"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Role Information */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Role & Permissions
              </h3>
              <div className="space-y-4">
                {data.currentUser.roles.map((role: string) => (
                  <div
                    key={role}
                    className="flex items-center justify-between p-3 rounded-md bg-primary/5"
                  >
                    <span className="capitalize font-medium text-foreground">{role}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 rounded-md hover:bg-primary/5 transition-colors text-foreground">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    <span>Notification Settings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-md hover:bg-primary/5 transition-colors text-foreground">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-muted-foreground" />
                    <span>Change Password</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-md hover:bg-primary/5 transition-colors text-foreground">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                    <span>Privacy Settings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-md hover:bg-primary/5 transition-colors text-foreground">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <span>Billing Settings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 