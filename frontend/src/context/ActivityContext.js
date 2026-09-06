import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/api';
import { getStoredToken } from '../api/api';

const ActivityContext = createContext();
const CHAT_STORAGE_KEY = 'internera_conversations_v1';

export function ActivityProvider({ children }) {
  const [applications, setApplications] = useState([]);

  const [savedInternships, setSavedInternships] = useState([]);

  const [conversations, setConversations] = useState([]);

  const [allInternships, setAllInternships] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);

  useEffect(() => {
    fetchGlobalData();
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setConversations(parsed);
      }
    } catch (e) {
      console.warn('Could not load conversations from storage:', e?.message);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.warn('Could not persist conversations to storage:', e?.message);
    }
  }, [conversations]);

  const fetchGlobalData = async () => {
    try {
      const intRes = await API.get('/internships/');
      const normalizedInternships = intRes.data.map((i) => ({
        ...i,
        id: i.internship_id,
        company: i.company?.company_name || `Company #${i.company_id || 'N/A'}`,
        match: typeof i.match === 'number' ? i.match : 0,
        skills: i.required_skills
          ? (Array.isArray(i.required_skills) ? i.required_skills : i.required_skills.split(','))
          : []
      }));
      setAllInternships(normalizedInternships);

      const compRes = await API.get('/companies/');
      setAllCompanies(compRes.data.map((c) => ({
        ...c,
        id: c.company_id,
        name: c.company_name
      })));

      const token = getStoredToken();
      const role = localStorage.getItem('role');
      const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
      const isStudentArea = pathname.startsWith('/student');

      // Only call protected student endpoints inside student routes.
      if (token && role === 'student' && isStudentArea) {
        try {
          const [appRes, reportRes] = await Promise.all([
            API.get('/applications/my'),
            API.get('/reports/my-student-report')
          ]);

          if (Array.isArray(appRes.data)) {
            const reportByInternship = {};
            (reportRes.data?.applied_internships || []).forEach((a) => {
              reportByInternship[a.internship_id] = a;
            });

            setApplications(appRes.data.map((a) => {
              const reportItem = reportByInternship[a.internship_id] || {};
              const internship = intRes.data.find((i) => i.internship_id === a.internship_id) || {};

              return {
                ...a,
                id: a.internship_id,
                title: reportItem.internship_title || internship.title || `Internship #${a.internship_id}`,
                company: reportItem.company_name || internship.company?.company_name || `Company #${internship.company_id || ''}`,
                location: internship.location || 'N/A',
                match: a.ai_match_score || reportItem.ai_match_score || 0,
                status: a.status || 'pending',
                applied_at: a.applied_at ? new Date(a.applied_at).toLocaleDateString() : '',
                applied_full: a.applied_at || null
              };
            }));
          }

          // Load saved internships from backend and map them to internship cards.
          try {
            const meRes = await API.get('/students/me/profile');
            const stdId = meRes?.data?.std_id;
            if (stdId) {
              const savedRes = await API.get(`/saved/${stdId}`);
              const savedRows = Array.isArray(savedRes?.data) ? savedRes.data : [];
              const byInternshipId = new Map(
                normalizedInternships.map((internship) => [String(internship.internship_id), internship])
              );
              const mappedSaved = savedRows
                .map((row) => {
                  const internship = byInternshipId.get(String(row.internship_id));
                  if (!internship) return null;
                  return {
                    ...internship,
                    saved_id: row.id
                  };
                })
                .filter(Boolean);
              setSavedInternships(mappedSaved);
            }
          } catch (e) {
            console.warn('Could not fetch saved internships from backend:', e.message);
          }
        } catch (e) {
          if (e?.response?.status === 401 || e?.response?.status === 403) {
            // Invalid/expired auth; prevent noisy loops on public pages.
            localStorage.removeItem('token');
            localStorage.removeItem('role');
          }
          console.warn('Could not fetch student applications from backend:', e.message);
        }
      }
    } catch (e) {
      console.error('ActivityContext Error:', e);
    }
  };

  const sendMessage = (partnerId, partnerName, text, sender) => {
    setConversations(prev => {
      const existingIdx = prev.findIndex(c => c.partnerId === partnerId);
      const newMessage = {
        id: Date.now(),
        sender,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          lastMessage: text,
          lastTimestamp: newMessage.timestamp,
          messages: [...updated[existingIdx].messages, newMessage]
        };
        return updated;
      } else {
        return [...prev, {
          partnerId,
          partnerName,
          lastMessage: text,
          lastTimestamp: newMessage.timestamp,
          messages: [newMessage]
        }];
      }
    });
  };

  const applyToInternship = () => {};

  const saveInternship = async (internship) => {
    const existing = savedInternships.find(s => String(s.id) === String(internship.id));
    const role = localStorage.getItem('role');

    // Keep UX instant.
    if (existing) {
      setSavedInternships(savedInternships.filter(s => String(s.id) !== String(internship.id)));
    } else {
      setSavedInternships([...savedInternships, internship]);
    }

    // Sync with backend for student users.
    if (role === 'student') {
      try {
        if (existing) {
          if (existing.saved_id) {
            await API.delete(`/saved/${existing.saved_id}`);
          } else {
            const meRes = await API.get('/students/me/profile');
            const stdId = meRes?.data?.std_id;
            if (stdId) {
              const savedRes = await API.get(`/saved/${stdId}`);
              const savedRows = Array.isArray(savedRes?.data) ? savedRes.data : [];
              const row = savedRows.find((r) => String(r.internship_id) === String(internship.internship_id || internship.id));
              if (row?.id) {
                await API.delete(`/saved/${row.id}`);
              }
            }
          }
        } else {
          await API.post(`/saved/?internship_id=${internship.internship_id || internship.id}`);
        }
      } catch (e) {
        // Revert optimistic update on backend failure.
        if (existing) {
          setSavedInternships((prev) => [...prev, existing]);
        } else {
          setSavedInternships((prev) => prev.filter((s) => String(s.id) !== String(internship.id)));
        }
        console.warn('Could not sync saved internship with backend:', e.message);
      }
    }
  };

  const getInternshipById = (id) => allInternships.find(i => i.id === parseInt(id));
  const getCompanyById = (id) => allCompanies.find(c => c.id === parseInt(id));

  return (
    <ActivityContext.Provider value={{
      applications,
      savedInternships,
      applyToInternship,
      saveInternship,
      allInternships,
      allCompanies,
      getInternshipById,
      getCompanyById,
      conversations,
      sendMessage,
      refreshGlobalData: fetchGlobalData
    }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  return useContext(ActivityContext);
}
