<!DOCTYPE html>
<html>
<head>
    <title>Navbar & Login Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 900px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .test-card {
            background: white;
            padding: 25px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #4F46E5;
            text-align: center;
        }
        h2 {
            color: #333;
            border-bottom: 2px solid #4F46E5;
            padding-bottom: 10px;
        }
        .status {
            padding: 10px 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .success {
            background: #D1FAE5;
            color: #065F46;
            border-left: 4px solid #10B981;
        }
        .info {
            background: #DBEAFE;
            color: #1E40AF;
            border-left: 4px solid #3B82F6;
        }
        .warning {
            background: #FEF3C7;
            color: #92400E;
            border-left: 4px solid #F59E0B;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e5e5;
        }
        th {
            background: #4F46E5;
            color: white;
        }
        .test-btn {
            background: #4F46E5;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 5px;
        }
        .test-btn:hover {
            background: #4338CA;
        }
        .result {
            background: #F9FAFB;
            padding: 15px;
            border-radius: 5px;
            margin-top: 15px;
            font-family: monospace;
            white-space: pre-wrap;
        }
        code {
            background: #F3F4F6;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <h1>🔧 Navbar & Login Test Suite</h1>

    <div class="test-card">
        <h2>📊 Database Role Check</h2>
        <div class="status info">
            Checking users table for role values...
        </div>
        <div id="dbRoleResult"></div>
        <button class="test-btn" onclick="checkDatabaseRoles()">Check Database Roles</button>
    </div>

    <div class="test-card">
        <h2>🧪 Test Registration & Login</h2>
        
        <h3>Test 1: Register as Family Member</h3>
        <form id="testRegisterFamily" onsubmit="testRegister(event, 'family')">
            <input type="text" id="family_username" placeholder="Username" required style="padding: 8px; margin: 5px; width: 200px;">
            <input type="email" id="family_email" placeholder="Email" required style="padding: 8px; margin: 5px; width: 200px;">
            <input type="password" id="family_password" placeholder="Password" required style="padding: 8px; margin: 5px; width: 200px;">
            <button type="submit" class="test-btn">Register Family</button>
        </form>
        <div id="registerFamilyResult" class="result" style="display:none;"></div>

        <h3>Test 2: Register as Guest</h3>
        <form id="testRegisterGuest" onsubmit="testRegister(event, 'guest')">
            <input type="text" id="guest_username" placeholder="Username" required style="padding: 8px; margin: 5px; width: 200px;">
            <input type="email" id="guest_email" placeholder="Email" required style="padding: 8px; margin: 5px; width: 200px;">
            <input type="password" id="guest_password" placeholder="Password" required style="padding: 8px; margin: 5px; width: 200px;">
            <button type="submit" class="test-btn">Register Guest</button>
        </form>
        <div id="registerGuestResult" class="result" style="display:none;"></div>

        <h3>Test 3: Test Login</h3>
        <form id="testLogin" onsubmit="testLogin(event)">
            <input type="text" id="login_username" placeholder="Username" required style="padding: 8px; margin: 5px; width: 200px;">
            <input type="password" id="login_password" placeholder="Password" required style="padding: 8px; margin: 5px; width: 200px;">
            <button type="submit" class="test-btn">Test Login</button>
        </form>
        <div id="loginResult" class="result" style="display:none;"></div>
    </div>

    <div class="test-card">
        <h2>📋 Role Mapping Reference</h2>
        <table>
            <thead>
                <tr>
                    <th>Frontend Sends</th>
                    <th>Backend Converts To</th>
                    <th>Database Stores</th>
                    <th>Navbar Shows</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>family</code></td>
                    <td>→ <code>customer</code></td>
                    <td>✅ customer</td>
                    <td>Home, Order Services, Tribute, AI Chatbot, Orders, FAQs</td>
                </tr>
                <tr>
                    <td><code>guest</code></td>
                    <td>→ <code>customer</code></td>
                    <td>✅ customer</td>
                    <td>Tribute, FAQs</td>
                </tr>
                <tr>
                    <td><code>provider</code></td>
                    <td>→ <code>provider</code></td>
                    <td>✅ provider</td>
                    <td>Dashboard, Packages, FAQs</td>
                </tr>
                <tr>
                    <td><code>admin</code></td>
                    <td>→ <code>admin</code></td>
                    <td>✅ admin</td>
                    <td>Home, Admin Panel, FAQs</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="test-card">
        <h2>✅ What Was Fixed</h2>
        <div class="status success">
            <strong>Fix 1:</strong> Navbar now accepts both <code>customer</code> and <code>family</code> roles
        </div>
        <div class="status success">
            <strong>Fix 2:</strong> Username display uses <code>user.name || user.username</code>
        </div>
        <div class="status success">
            <strong>Fix 3:</strong> Backend maps <code>family</code> → <code>customer</code> automatically
        </div>
        <div class="status success">
            <strong>Fix 4:</strong> Backend maps <code>guest</code> → <code>customer</code> automatically
        </div>
        <div class="status success">
            <strong>Fix 5:</strong> Added default fallback for unrecognized roles
        </div>
    </div>

    <script>
        async function checkDatabaseRoles() {
            const resultDiv = document.getElementById('dbRoleResult');
            resultDiv.innerHTML = '<div class="status info">Loading...</div>';
            
            try {
                const response = await fetch('/backend/check-user-roles.php');
                const data = await response.json();
                
                if (data.success) {
                    let html = '<table><thead><tr><th>User ID</th><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>';
                    data.users.forEach(user => {
                        html += `<tr>
                            <td>${user.user_id}</td>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td><strong>${user.role}</strong></td>
                        </tr>`;
                    });
                    html += '</tbody></table>';
                    html += `<div class="status success">Total users: ${data.users.length}</div>`;
                    resultDiv.innerHTML = html;
                } else {
                    resultDiv.innerHTML = '<div class="status warning">No users found or error occurred</div>';
                }
            } catch (error) {
                resultDiv.innerHTML = `<div class="status warning">Error: ${error.message}</div>`;
            }
        }

        async function testRegister(event, role) {
            event.preventDefault();
            
            const prefix = role === 'family' ? 'family' : 'guest';
            const username = document.getElementById(`${prefix}_username`).value;
            const email = document.getElementById(`${prefix}_email`).value;
            const password = document.getElementById(`${prefix}_password`).value;
            const resultDiv = document.getElementById(`register${role === 'family' ? 'Family' : 'Guest'}Result`);
            
            resultDiv.style.display = 'block';
            resultDiv.textContent = 'Registering...';
            
            try {
                const response = await fetch('/backend/register.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username,
                        email,
                        password,
                        role
                    })
                });
                
                const data = await response.json();
                
                resultDiv.textContent = JSON.stringify(data, null, 2);
                
                if (data.success) {
                    resultDiv.innerHTML = `<div class="status success">
                        ✅ Registration successful!<br>
                        Frontend sent: <code>${role}</code><br>
                        Backend stored: <code>customer</code> (check database to confirm)<br>
                        Now try logging in!
                    </div>`;
                }
            } catch (error) {
                resultDiv.textContent = `Error: ${error.message}`;
            }
        }

        async function testLogin(event) {
            event.preventDefault();
            
            const username = document.getElementById('login_username').value;
            const password = document.getElementById('login_password').value;
            const resultDiv = document.getElementById('loginResult');
            
            resultDiv.style.display = 'block';
            resultDiv.textContent = 'Logging in...';
            
            try {
                const response = await fetch('/backend/login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username,
                        password
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    resultDiv.innerHTML = `<div class="status success">
                        ✅ Login successful!<br><br>
                        <strong>User Data Received:</strong><br>
                        user_id: ${data.user.user_id}<br>
                        name: ${data.user.name}<br>
                        email: ${data.user.email}<br>
                        role: <strong>${data.user.role}</strong><br><br>
                        <strong>Navbar will show:</strong><br>
                        ${data.user.role === 'customer' ? 'Home, Order Services, Tribute, AI Chatbot, Orders, FAQs' : 
                          data.user.role === 'provider' ? 'Dashboard, Packages, FAQs' : 
                          data.user.role === 'admin' ? 'Home, Admin Panel, FAQs' : 'Default links'}
                    </div>`;
                } else {
                    resultDiv.innerHTML = `<div class="status warning">Login failed: ${data.message}</div>`;
                }
            } catch (error) {
                resultDiv.innerHTML = `<div class="status warning">Error: ${error.message}</div>`;
            }
        }

        // Auto-check on load
        window.onload = function() {
            checkDatabaseRoles();
        };
    </script>
</body>
</html>
