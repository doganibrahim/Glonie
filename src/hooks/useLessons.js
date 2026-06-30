import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useLessons = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getLessons();
      setLessons(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  return {
    lessons,
    loading,
    error,
    refetch: fetchLessons
  };
};

export const useLesson = (lessonId) => {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLesson = async (id) => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await api.getLesson(id);
      setLesson(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson(lessonId);
  }, [lessonId]);

  return {
    lesson,
    loading,
    error,
    refetch: () => fetchLesson(lessonId)
  };
};