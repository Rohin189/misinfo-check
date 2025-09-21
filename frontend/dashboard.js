      // Get the elements
      const welcomeEl = document.getElementById("welcome");
      const logoutBtn = document.getElementById("logoutBtn");
      const newsTextarea = document.getElementById("newsText");
      const checkBtn = document.getElementById("checkBtn");
      const resultDiv = document.getElementById("result");
      const verdictTextEl = document.getElementById("verdictText");

      // Elements for stats
      const totalEl = document.getElementById("total");
      const trueEl = document.getElementById("true");
      const falseEl = document.getElementById("false");
      const misleadingEl = document.getElementById("misleading");

      // Element for history
      const reportListEl = document.getElementById("reportList");

      // Function to handle logout
      const handleLogout = async () => {
        try {
          await fetch("/api/user/logout", { method: "POST" });
          window.location.href = "/login.html";
        } catch (err) {
          console.error("Logout failed:", err);
          alert("Logout failed. Please try again.");
        }
      };

      // Function to fetch user data and populate the dashboard
      const fetchUserData = async () => {
        try {
          const res = await fetch("/api/user/dashboard", {
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            console.log(data);
            welcomeEl.textContent = `Welcome, ${data.user.name}!`;
          } else {
            window.location.href = "/login.html";
          }
        } catch (err) {
          console.error("Failed to fetch user data:", err);
          window.location.href = "/login.html";
        }
      };

      // Function to load stats and history
      const loadDashboardData = async () => {
        try {
          // Fetch stats
          const statsRes = await fetch("/api/dashboard/stats", {
            credentials: "include",
          });
          if (!statsRes.ok) throw new Error("Failed to fetch stats");
          const statsData = await statsRes.json();
          if (statsData.success) {
            totalEl.textContent = statsData.stats.total;
            trueEl.textContent = statsData.stats.trueCount;
            falseEl.textContent = statsData.stats.falseCount;
            misleadingEl.textContent = statsData.stats.misleadingCount;
          }

          // Fetch history
          const historyRes = await fetch("/api/dashboard/history", {
            credentials: "include",
          });
          if (!historyRes.ok) throw new Error("Failed to fetch history");
          const historyData = await historyRes.json();
          if (historyData.success) {
            reportListEl.innerHTML = ""; // Clear previous entries
            if (historyData.reports.length === 0) {
              reportListEl.innerHTML =
                "<li>No history yet. Check some text above!</li>";
            } else {
              historyData.reports.forEach((r) => {
                const li = document.createElement("li");
                // Add a styled verdict tag
                li.innerHTML = `"${r.text}" → <span class="verdict-tag verdict-tag-${r.verdict}">${r.verdict}</span>`;
                reportListEl.appendChild(li);
              });
            }
          }
        } catch (err) {
          console.error("Dashboard loading error", err);
          // Don't redirect here, as the main user check handles that.
          // Just show an error state for the dashboard sections.
          totalEl.textContent = "Error";
          reportListEl.innerHTML = "<li>Could not load history.</li>";
        }
      };

      // Function to handle misinformation check
      const handleCheck = async () => {
        const text = newsTextarea.value.trim();
        if (!text) {
          alert("Please enter some text to check.");
          return;
        }

        checkBtn.disabled = true;
        checkBtn.textContent = "Checking...";
        resultDiv.classList.add("hidden");

        try {
          const res = await fetch("/api/check/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
            credentials: "include", 
          });
          const data = await res.json();

          if (res.ok) {
            verdictTextEl.innerHTML = `<strong>Verdict:</strong> ${data.verdict}`;
            resultDiv.className = `verdict-${data.verdict}`;
            resultDiv.classList.remove("hidden");
          } else {
            verdictTextEl.innerHTML = `<strong>Error:</strong> ${
              data.error || "Failed to check."
            }`;
            resultDiv.className = `verdict-False`;
            resultDiv.classList.remove("hidden");
          }
        } catch (err) {
          console.error("API call failed:", err);
          verdictTextEl.innerHTML = `<strong>Error:</strong> Server error.`;
          resultDiv.className = `verdict-False`;
          resultDiv.classList.remove("hidden");
        } finally {
          checkBtn.disabled = false;
          checkBtn.textContent = "Check";
        }
      };

      // Attach event listeners
    document.addEventListener("DOMContentLoaded", () => {
        fetchUserData();
    });

    logoutBtn.addEventListener("click", handleLogout);
    checkBtn.addEventListener("click", handleCheck);