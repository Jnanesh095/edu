import React, { useEffect, useState } from "react";
import './index.css';
import './App.css';

// Initial data remains the same...
const initialResources = [
  {
    id: 1,
    title: "DBMS Notes - Unit 1",
    description: "Comprehensive DBMS notes covering ER model and normalization.",
    category: "Computer Science",
    uploadedBy: "Admin",
    uploadDate: "2025-11-01",
    downloads: 45,
    reviews: [
      { user: "Student A", comment: "Very helpful!", rating: 5 },
      { user: "Student B", comment: "Good explanation.", rating: 4 }
    ]
  },
  {
    id: 2,
    title: "Microprocessor Lab Manual",
    description: "Step-by-step experiments with assembly code examples.",
    category: "Electronics",
    uploadedBy: "Admin",
    uploadDate: "2025-11-02",
    downloads: 30,
    reviews: [
      { user: "Student C", comment: "Perfect for revision.", rating: 5 }
    ]
  },
  {
    id: 3,
    title: "Mathematics Formula Sheet",
    description: "Quick formulas for Calculus, Algebra, and Geometry.",
    category: "Mathematics",
    uploadedBy: "Admin",
    uploadDate: "2025-11-03",
    downloads: 60,
    reviews: []
  }
];

// -----------------------------------------------------------------
// 1. NEW LOGIN PAGE COMPONENT
// -----------------------------------------------------------------
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);

  // CAPTCHA state
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  useEffect(() => {
    // load remembered username
    const remembered = localStorage.getItem('edulibrary_remember');
    if (remembered) {
      setUsername(remembered);
      setRemember(true);
    }
    setCaptcha(Math.random().toString(36).substring(2, 7).toUpperCase());
  }, []);

  const refreshCaptcha = () => setCaptcha(Math.random().toString(36).substring(2, 7).toUpperCase());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (captchaInput !== captcha) {
      setError("CAPTCHA code is incorrect. Please try again.");
      refreshCaptcha();
      setCaptchaInput("");
      return;
    }

    if (username === "admin" && password === "admin123") {
      if (remember) localStorage.setItem('edulibrary_remember', username); else localStorage.removeItem('edulibrary_remember');
      onLogin(true, username);
      setError("");
    } else if (username === "user" && password === "user123") {
      if (remember) localStorage.setItem('edulibrary_remember', username); else localStorage.removeItem('edulibrary_remember');
      onLogin(false, username);
      setError("");
    } else {
      setError("Invalid username or password. (Hint: user/user123 or admin/admin123)");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">📚</div>
          <h2 className="login-brand__title">EduLibrary</h2>
          <p className="login-brand__subtitle">Learn, share and collaborate — admins can upload resources</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} aria-label="Login form">
          <div className="login-form__group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="login-form__input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>

          <div className="login-form__group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="login-form__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <div className="login-form__group captcha-row">
            <div className="captcha-box" aria-hidden>{captcha}</div>
            <button type="button" className="btn btn--captcha-refresh" onClick={refreshCaptcha} title="Refresh CAPTCHA">↻</button>
            <input
              type="text"
              id="captcha"
              className="login-form__input captcha-input"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
              autoComplete="off"
              maxLength={5}
              placeholder="Enter code"
              required
            />
          </div>

          <div className="login-form__group login-remember">
            <label>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me
            </label>
          </div>

          {error && <p className="login-form__error">{error}</p>}

          <button type="submit" className="btn btn--login">Login</button>
          <p className="login-help">Try <strong>admin/admin123</strong> or <strong>user/user123</strong></p>
        </form>
      </div>
    </div>
  );
}


// -----------------------------------------------------------------
// 2. YOUR EXISTING APP, RENAMED TO "ResourceLibrary"
// -----------------------------------------------------------------
function ResourceLibrary({ isAdmin, onLogout, onToggleDarkMode, darkMode, userName }) {
  // Initialize resources from localStorage, or use initialResources if not found
  const [resources, setResources] = useState(() => {
    const saved = localStorage.getItem('edulibraryResources');
    return saved ? JSON.parse(saved) : initialResources;
  });
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "", category: "" });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showUploadPortal, setShowUploadPortal] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Save resources to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('edulibraryResources', JSON.stringify(resources));
  }, [resources]);

  // Handlers are all the same...
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      setResources(resources.filter((r) => r.id !== id));
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description,
      category: resource.category
    });
  };

  const handleSave = () => {
    setResources((prev) =>
      prev.map((r) => (r.id === editingResource.id ? { ...r, ...formData } : r))
    );
    setEditingResource(null);
  };
  
  const handleDownload = (id) => {
    setResources(prevResources =>
      prevResources.map(r => 
        r.id === id ? { ...r, downloads: r.downloads + 1 } : r
      )
    );
  };

  const handleAddReview = (resourceId, newReview) => {
    setResources(prevResources =>
      prevResources.map(r => {
        if (r.id === resourceId) {
          return {
            ...r,
            reviews: [...r.reviews, newReview]
          };
        }
        return r;
      })
    );
  };

  const handleUploadResource = (uploadData) => {
    const newResource = {
      id: Math.max(...resources.map(r => r.id), 0) + 1,
      title: uploadData.title,
      description: uploadData.description,
      category: uploadData.category,
      uploadedBy: userName,
      uploadDate: new Date().toISOString().split('T')[0],
      downloads: 0,
      reviews: [],
      fileName: uploadData.fileName,
      fileDataUrl: uploadData.fileDataUrl // Store base64 data URL
    };
    setResources([...resources, newResource]);
    setShowUploadPortal(false);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const filteredResources = resources.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...new Set(resources.map((r) => r.category))];

  return (
    // We use a Fragment <>...</> here because the main "app" div
    // is now handled by the parent App component
    <>
      <header className="app-header">
        <h1 className="app-header__title">📚 EduLibrary</h1>
        <div className="app-header__controls">
          <button
            onClick={onToggleDarkMode} // Passed from parent
            className="btn btn--toggle-dark"
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <button
            onClick={onLogout} // Passed from parent
            className="btn btn--logout" // New class for styling
          >
            Logout
          </button>
        </div>
      </header>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="🔍 Search resources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-bar__search"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="filter-bar__select"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {editingResource && (
        <div className="edit-form animate-fadeIn">
          <h2 className="edit-form__title">✏️ Edit Resource</h2>
          <input
            className="edit-form__input"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Title"
          />
          <textarea
            className="edit-form__textarea"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description"
          />
          <input
            className="edit-form__input"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Category"
          />
          <div className="edit-form__actions">
            <button className="btn btn--save" onClick={handleSave}>💾 Save</button>
            <button className="btn btn--cancel" onClick={() => setEditingResource(null)}>✖ Cancel</button>
          </div>
        </div>
      )}

      <div className="upload-section">
        {isAdmin && (
          <>
            {uploadSuccess && (
              <div className="upload-success">
                ✅ Resource uploaded successfully! It's now available in the library.
              </div>
            )}
            
            <button 
              className="btn btn--upload-toggle"
              onClick={() => setShowUploadPortal(!showUploadPortal)}
            >
              📤 {showUploadPortal ? "Hide Upload" : "Upload Resource"}
            </button>

            {showUploadPortal && (
              <UploadForm 
                userName={userName}
                onUpload={handleUploadResource}
                onCancel={() => setShowUploadPortal(false)}
              />
            )}
            
            <div className="admin-info">
              <p>Total resources in library: <strong>{resources.length}</strong></p>
            </div>
          </>
        )}
        
        {!isAdmin && (
          <div className="user-notice">
            <p>📚 Available resources: <strong>{resources.length}</strong> | Resources shared by admins and instructors appear below</p>
          </div>
        )}
      </div>

      <div className="resource-grid">
        {filteredResources.map((res) => (
          <ResourceCard
            key={res.id}
            resource={res}
            isAdmin={isAdmin} // Passed from parent
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onAddReview={handleAddReview}
          />
        ))}
      </div>

      <footer className="app-footer">
        © {new Date().getFullYear()} EduLibrary | Built with ❤️ using React + Tailwind CSS
      </footer>
    </>
  );
}


// -----------------------------------------------------------------
// 3. YOUR NEW MAIN "App" COMPONENT (Authentication Manager)
// -----------------------------------------------------------------
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userName, setUserName] = useState("");

  // Dark mode logic is now at the top level
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleLogin = (isUserAdmin, username) => {
    setIsLoggedIn(true);
    setIsAdmin(isUserAdmin);
    setUserName(username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="app">
      {isLoggedIn ? (
        <ResourceLibrary 
          isAdmin={isAdmin} 
          onLogout={handleLogout}
          onToggleDarkMode={handleToggleDarkMode}
          darkMode={darkMode}
          userName={userName}
        />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}


// -----------------------------------------------------------------
// 4. ResourceCard COMPONENT (Unchanged from your last version)
// -----------------------------------------------------------------
function ResourceCard({ 
  resource, 
  isAdmin, 
  onEdit, 
  onDelete, 
  onDownload, 
  onAddReview 
}) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userName, setUserName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) {
      alert("Please fill in your name and comment.");
      return;
    }

    const newReview = {
      user: userName,
      comment: comment,
      rating: parseInt(rating, 10)
    };

    onAddReview(resource.id, newReview);

    // Reset form and hide it
    setShowReviewForm(false);
    setUserName("");
    setComment("");
    setRating(5);
  };

  // Download handler for PDF
  const handleDownloadFile = () => {
    if (resource.fileName && resource.fileName.toLowerCase().endsWith('.pdf') && resource.fileDataUrl) {
      const a = document.createElement('a');
      a.href = resource.fileDataUrl;
      a.download = resource.fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);
    } else {
      alert('No PDF file available for download.');
    }
  };

  return (
    <div className="resource-card">
      <h2 className="resource-card__title">{resource.title}</h2>
      <p className="resource-card__description">{resource.description}</p>
      <div className="resource-card__meta">
        <p><strong>Category:</strong> {resource.category}</p>
        <p><strong>Uploaded by:</strong> {resource.uploadedBy} on {resource.uploadDate}</p>
        <p><strong>Downloads:</strong> {resource.downloads}</p>
      </div>

      {/* Reviews List */}
      {resource.reviews.length > 0 ? (
        <div className="resource-card__reviews">
          <p className="resource-card__reviews-title">Reviews:</p>
          {resource.reviews.map((r, i) => (
            <div key={i} className="resource-card__review-item">
              <p><strong>{r.user}:</strong> {r.comment} <span className="resource-card__review-rating">({r.rating}★)</span></p>
            </div>
          ))}
        </div>
      ) : (
        <p className="resource-card__no-reviews">No reviews yet.</p>
      )}

      {/* Review Adder Section */}
      <div className="resource-card__review-adder">
        {!showReviewForm && (
          <button 
            className="btn btn--add-review"
            onClick={() => setShowReviewForm(true)}
          >
            ✍️ Add Review
          </button>
        )}

        {showReviewForm && (
          <form className="review-form" onSubmit={handleSubmitReview}>
            <h4 className="review-form__title">Write a Review</h4>
            <div className="review-form__group">
              <label htmlFor={`user-${resource.id}`}>Your Name:</label>
              <input
                type="text"
                id={`user-${resource.id}`}
                className="review-form__input"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>
            <div className="review-form__group">
              <label htmlFor={`comment-${resource.id}`}>Comment:</label>
              <textarea
                id={`comment-${resource.id}`}
                className="review-form__textarea"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="3"
                required
              />
            </div>
            <div className="review-form__group">
              <label htmlFor={`rating-${resource.id}`}>Rating (1-5):</label>
              <input
                type="number"
                id={`rating-${resource.id}`}
                className="review-form__input"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                min="1"
                max="5"
                required
              />
            </div>
            <div className="review-form__actions">
              <button type="submit" className="btn btn--save">Submit</button>
              <button 
                type="button" 
                className="btn btn--cancel" 
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Main Actions Bar */}
      <div className="resource-card__actions">
        {resource.fileName && resource.fileName.toLowerCase().endsWith('.pdf') ? (
          <button
            className="btn btn--download"
            onClick={handleDownloadFile}
          >
            ⬇️ Download PDF
          </button>
        ) : (
          <button className="btn btn--download" disabled>
            ⬇️ Download (PDF only)
          </button>
        )}
        {isAdmin && (
          <> {/* Fragment to group admin buttons */}
            <button
              className="btn btn--edit"
              onClick={() => onEdit(resource)}
            >
              ✏️ Edit
            </button>
            <button
              className="btn btn--delete"
              onClick={() => onDelete(resource.id)}
            >
              🗑️ Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------
// 5. UploadForm COMPONENT
// -----------------------------------------------------------------
function UploadForm({ userName, onUpload, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Computer Science");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError("File size exceeds 10MB limit");
        setFile(null);
      } else {
        setError("");
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category.trim() || !file) {
      setError("Please fill in all fields and select a file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result;
      onUpload({
        title,
        description,
        category,
        fileName: file.name,
        fileDataUrl: base64data
      });
      setTitle("");
      setDescription("");
      setCategory("Computer Science");
      setFile(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="upload-form">
      <h2 className="upload-form__title">📤 Upload New Resource</h2>
      {error && <p className="upload-form__error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="upload-form__group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="upload-form__group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            required
          />
        </div>
        <div className="upload-form__group">
          <label htmlFor="category">Category:</label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>
        <div className="upload-form__group">
          <label htmlFor="file">Select PDF file (max 10MB):</label>
          <input
            type="file"
            id="file"
            accept="application/pdf"
            onChange={handleFileChange}
            required
          />
        </div>
        <div className="upload-form__actions">
          <button type="submit" className="btn btn--upload">Upload Resource</button>
          <button type="button" className="btn btn--cancel" onClick={onCancel}>
            ❌ Cancel
          </button>
        </div>
      </form>
    </div>
  );
}