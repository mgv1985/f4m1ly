const videos = window.FAMILY_VIDEOS || [];
const grid = document.querySelector("#filmGrid");
const count = document.querySelector("#filmCount");
const filters = document.querySelector("#filters");
const search = document.querySelector("#searchInput");
const emptyState = document.querySelector("#emptyState");
let activeCategory = "All";

const escapeHtml = (text) => String(text).replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;",
}[character]));

function renderFilters() {
  const categories = ["All", ...new Set(videos.map((video) => video.category))];
  filters.innerHTML = categories.map((category) => `
    <button class="filter ${category === activeCategory ? "active" : ""}" type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>
  `).join("");
}

function renderVideos() {
  const term = search.value.trim().toLowerCase();
  const visible = videos.filter((video) => {
    const matchesCategory = activeCategory === "All" || video.category === activeCategory;
    const haystack = [video.title, video.year, video.category, video.location].join(" ").toLowerCase();
    return matchesCategory && haystack.includes(term);
  });

  count.textContent = `${visible.length} ${visible.length === 1 ? "film" : "films"}`;
  emptyState.hidden = visible.length !== 0;
  grid.innerHTML = visible.map((video, index) => `
    <tr style="--delay: ${index * 35}ms">
      <td class="title-cell"><a href="https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}" target="_blank" rel="noopener noreferrer">${escapeHtml(video.title)}</a></td>
      <td data-label="Year">${escapeHtml(video.year || "—")}</td>
      <td data-label="Collection"><span class="category-label">${escapeHtml(video.category || "—")}</span></td>
      <td data-label="Place">${escapeHtml(video.location || "—")}</td>
      <td data-label="Length">${escapeHtml(video.duration || "—")}</td>
      <td class="open-cell"><a href="https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}" target="_blank" rel="noopener noreferrer" aria-label="Watch ${escapeHtml(video.title)} on YouTube">Watch <span aria-hidden="true">↗</span></a></td>
    </tr>
  `).join("");
}

filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderFilters();
  renderVideos();
});
search.addEventListener("input", renderVideos);
document.querySelector("#clearSearch").addEventListener("click", () => { search.value = ""; activeCategory = "All"; renderFilters(); renderVideos(); search.focus(); });

const aboutDialog = document.querySelector("#aboutDialog");
document.querySelector("#aboutButton").addEventListener("click", () => aboutDialog.showModal());
document.querySelector("#closeAbout").addEventListener("click", () => aboutDialog.close());
aboutDialog.addEventListener("click", (event) => { if (event.target === aboutDialog) aboutDialog.close(); });

document.querySelector("#currentYear").textContent = new Date().getFullYear();
renderFilters();
renderVideos();
