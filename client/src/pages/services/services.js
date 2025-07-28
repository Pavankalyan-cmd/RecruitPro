import { getAuth } from "firebase/auth";
import axios from "axios";

const API_BASE = process.env.REACT_APP_BASE_URL;

export const candidateResume = async (resumeFiles) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not authenticated");

  const idToken = await user.getIdToken();

  const formData = new FormData();
  resumeFiles.forEach((file) => {
    formData.append("resumes", file);
  });

  try {
    const response = await axios.post(
      `${API_BASE}/api/candidate-resume`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error analyzing resume(s):",
      error.response?.data || error.message
    );
    throw error;
  }
};


export const getCandidateResumes = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not authenticated");

  const idToken = await user.getIdToken();

  try {
    const response = await axios.get(`${API_BASE}/api/candidate-resumes`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    console.log(response.data.candidates);
    return response.data.candidates; // Return just the list
  } catch (error) {
    console.error(
      "Error fetching candidate resumes:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getJobDescriptions = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not authenticated");

  const idToken = await user.getIdToken();

  try {
    const response = await axios.get(`${API_BASE}/api/job-descriptions`, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    console.log(response.data.job_descriptions);
    return response.data.job_descriptions; // Return just the JD list
  } catch (error) {
    console.error(
      "Error fetching job descriptions:",
      error.response?.data || error.message
    );
    throw error;
  }
};



export const uploadJobDescriptions = async (files) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not authenticated");

  const idToken = await user.getIdToken();

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("jd_files", file); // plural field to match FastAPI param
  });

  const response = await axios.post(`${API_BASE}/api/upload-jd`, formData, {
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};


export const deleteCandidate = async (candidate_id) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not authenticated");

  const idToken = await user.getIdToken();

  const response = await axios.delete(
    `${API_BASE}/api/candidate-resume/${candidate_id}`,
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    }
  );

  return response.data;
};
export const deleteJobDescription = async (jd_id) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not authenticated");

  const idToken = await user.getIdToken();

  const response = await axios.delete(
    `${API_BASE}/api/job-description/${jd_id}`,
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    }
  );

  return response.data;
};
export const getTopScoreCandidates = async (jd_id) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not authenticated");

  const idToken = await user.getIdToken();

  const response = await axios.get(`${API_BASE}/api/top-score/${jd_id}`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
  console.log(response.data)
  return response.data;
};



export const fetchUserWeights = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not authenticated");

  const idToken = await user.getIdToken();

  const response = await axios.get(`${API_BASE}/api/user-weights`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
  

  console.log(response.data)
  return response.data;
};


export const updateUserWeights = async (role, newWeights) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not authenticated");

  const idToken = await user.getIdToken();

  const response = await axios.put(
    `${API_BASE}/api/user-weights/${role}`,
    { weights: newWeights },
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    }
  );

  return response.data;
};