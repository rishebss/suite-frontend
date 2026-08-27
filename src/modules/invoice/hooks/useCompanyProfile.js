import { useState, useEffect, useCallback } from 'react';
import { companyProfileApi } from '../api/invoiceApi';

/**
 * Fetch and manage the singleton CompanyProfile (admin-only).
 */
export function useCompanyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await companyProfileApi.get();
      setProfile(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load company profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (data, partial = true) => {
    try {
      const res = await companyProfileApi.update(data, partial);
      setProfile(res.data.data);
      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed.';
      return { success: false, message: msg, errors: err.response?.data?.errors };
    }
  };

  const uploadAsset = async (type, file) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      let res;
      if (type === 'logo') res = await companyProfileApi.uploadLogo(formData);
      else if (type === 'signature') res = await companyProfileApi.uploadSignature(formData);
      else res = await companyProfileApi.uploadSeal(formData);
      await fetchProfile();
      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.image?.[0] || 'Upload failed.';
      return { success: false, message: msg };
    }
  };

  const removeAsset = async (type) => {
    try {
      if (type === 'logo') await companyProfileApi.removeLogo();
      else if (type === 'signature') await companyProfileApi.removeSignature();
      else await companyProfileApi.removeSeal();
      await fetchProfile();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Remove failed.' };
    }
  };

  return { profile, loading, error, refetch: fetchProfile, updateProfile, uploadAsset, removeAsset };
}
