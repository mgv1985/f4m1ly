const videos = window.FAMILY_VIDEOS || [];
const grid = document.querySelector("#filmGrid");
const count = document.querySelector("#filmCount");
const filters = document.querySelector("#filters");
const search = document.querySelector("#searchInput");
const emptyState = document.querySelector("#emptyState");
let activeCategory = "All";

const getTags = (video) => video.tags?.length ? video.tags : [video.category].filter(Boolean);

const escapeHtml = (text) => String(text).replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;",
}[character]));

function renderFilters() {
  const tags = ["All", ...new Set(videos.flatMap(getTags))];
  filters.innerHTML = tags.map((tag) => `
    <button class="filter ${tag === activeCategory ? "active" : ""}" type="button" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>
  `).join("");
}

function renderVideos() {
  const term = search.value.trim().toLowerCase();
  const visible = videos.filter((video) => {
    const tags = getTags(video);
    const matchesTag = activeCategory === "All" || tags.includes(activeCategory);
    const haystack = [video.title, video.year, video.category, video.location, ...tags].join(" ").toLowerCase();
    return matchesTag && haystack.includes(term);
  });

  count.textContent = `${visible.length} ${visible.length === 1 ? "film" : "films"}`;
  emptyState.hidden = visible.length !== 0;
  grid.innerHTML = visible.map((video, index) => `
    <tr style="--delay: ${index * 35}ms">
      <td class="title-cell"><a href="https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}" target="_blank" rel="noopener noreferrer">${escapeHtml(video.title)}</a></td>
      <td data-label="Year">${escapeHtml(video.year || "—")}</td>
      <td data-label="Collection"><button class="category-label" type="button" data-tag="${escapeHtml(video.category || "")}" ${video.category ? "" : "disabled"}>${escapeHtml(video.category || "—")}</button></td>
      <td data-label="Place">${escapeHtml(video.location || "—")}</td>
      <td data-label="Length">${escapeHtml(video.duration || "—")}</td>
      <td class="open-cell"><a href="https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}" target="_blank" rel="noopener noreferrer" aria-label="Watch ${escapeHtml(video.title)} on YouTube">Watch <span aria-hidden="true">↗</span></a></td>
    </tr>
  `).join("");
}

function selectTag(event) {
  const button = event.target.closest("[data-tag]");
  if (!button) return;
  activeCategory = button.dataset.tag;
  renderFilters();
  renderVideos();
}

filters.addEventListener("click", selectTag);
grid.addEventListener("click", selectTag);
search.addEventListener("input", renderVideos);
document.querySelector("#clearSearch").addEventListener("click", () => { search.value = ""; activeCategory = "All"; renderFilters(); renderVideos(); search.focus(); });

const aboutDialog = document.querySelector("#aboutDialog");
document.querySelector("#aboutButton").addEventListener("click", () => aboutDialog.showModal());
document.querySelector("#closeAbout").addEventListener("click", () => aboutDialog.close());
aboutDialog.addEventListener("click", (event) => { if (event.target === aboutDialog) aboutDialog.close(); });

document.querySelector("#currentYear").textContent = new Date().getFullYear();
renderFilters();
renderVideos();
