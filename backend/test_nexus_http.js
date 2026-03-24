import axios from 'axios';

const testNetworkAPI = async () => {
  const api = axios.create({
    baseURL: 'http://127.0.0.1:3000/api',
    withCredentials: true // capture cookies
  });

  try {
    console.log("1. Logging in...");
    const loginRes = await api.post('/auth/login', {
      email: 'test123@gmail.com',
      password: 'password123'
    });
    
    // Extract cookie from response headers manually for nodejs axios
    const cookies = loginRes.headers['set-cookie'];
    if (!cookies) throw new Error("No cookies returned from login!");

    console.log("✅ Login successful. Token received.");

    console.log("\n2. Hitting Nexus Chat API...");
    const chatRes = await api.post('/nexus/ask', 
      { query: "kaise ho" },
      { headers: { Cookie: cookies.join('; ') } }
    );

    console.log("✅ Chat Response:", chatRes.data.answer);

  } catch (error) {
    if (error.response) {
      console.error(`❌ HTTP Error ${error.response.status}:`, error.response.data);
    } else {
      console.error("❌ Network Error:", error.message);
    }
  }
};

testNetworkAPI();
