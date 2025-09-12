function createActiveUsersPanel(containerId = "activeUsersPanel", apiEndpoint = "/api/active-users") {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID '${containerId}' not found.`);
    return;
  }

  container.style.fontFamily = `"Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
  container.style.background = `linear-gradient(135deg, #2e2e2e, #1c1c1c)`;
  container.style.color = "#f0f0f0";
  container.style.minHeight = "100vh";
  container.style.padding = "40px 80px";

  const header = document.createElement("h1");
  header.style.color = "#ff7a29";
  header.style.marginBottom = "24px";
  header.textContent = "Active Users";
  container.appendChild(header);

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.style.backgroundColor = "#333";
  table.style.borderRadius = "10px";
  table.style.overflow = "hidden";
  table.style.boxShadow = "0 10px 40px rgba(255, 122, 41, 0.6)";
  table.setAttribute("aria-live", "polite");

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th style="padding: 12px 16px; text-align: left; border-bottom: 1px solid #ff7a29; font-size: 1rem; background: #ff7a2944;">User ID</th>
      <th style="padding: 12px 16px; text-align: left; border-bottom: 1px solid #ff7a29; font-size: 1rem; background: #ff7a2944;">Username</th>
      <th style="padding: 12px 16px; text-align: left; border-bottom: 1px solid #ff7a29; font-size: 1rem; background: #ff7a2944;">Last Activity</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  tbody.innerHTML = '<tr><td colspan="3" style="padding: 12px 16px;">Loading active users...</td></tr>';
  table.appendChild(tbody);

  container.appendChild(table);

  async function fetchActiveUsers() {
    try {
      const response = await fetch(apiEndpoint);
      if (!response.ok) throw new Error("Failed to fetch active users.");
      const users = await response.json();
      if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="padding: 12px 16px;">No active users found.</td></tr>';
        return;
      }
      tbody.innerHTML = users.map(u => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #ff7a29;">${u.id}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #ff7a29;">${u.username}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #ff7a29;">${u.lastActivity}</td>
        </tr>
      `).join("");
    } catch (error) {
      tbody.innerHTML = '<tr><td colspan="3" style="padding: 12px 16px;">Failed to load active users.</td></tr>';
      console.error(error);
    }
  }

  fetchActiveUsers();
  setInterval(fetchActiveUsers, 30000);
}
