document.addEventListener("DOMContentLoaded", function () {
    const APIURL = "https://api.github.com/users/";
    const userInfoContainer = document.getElementById("user-info");
    const reposContainer = document.getElementById("repos-container");

    const getUser = async (username, page, perPage) => {
        try {
            const response = await fetch(`${APIURL}${username}`);
            if (!response.ok) {
                throw new Error(`GitHub API request failed: ${response.status}`);
            }
            const userData = await response.json();

            // Display user information
            const userInfo = `
                <div class="card">
                    <div>
                        <img class="avatar" src="${userData.avatar_url}" alt="Avatar">
                    </div>
                    <div class="user-info">
                        <h2>${userData.name || 'Name'}</h2>
                        <p>${userData.bio || 'Bio'}</p>
                        <ul class="info">
                            <li>Followers: <strong>${userData.followers}</strong></li>
                            <li>Following: <strong>${userData.following}</strong></li>
                            <li>Repos: <strong>${userData.public_repos}</strong></li>
                        </ul>
                    </div>
                </div>
            `;
            userInfoContainer.innerHTML = userInfo;

            getRepos(username, page, perPage);
        } catch (error) {
            console.error("Error fetching user data:", error.message);
        }
    };

    let totalRepos = [];

    const getRepos = async (username, page, perPage) => {
        try {
            const reposContainer = document.getElementById("repos-container");
            reposContainer.innerHTML = ""; // Clear previous repositories

            if (totalRepos.length === 0) {
                const reposResponse = await fetch(`${APIURL}${username}/repos`);
                if (!reposResponse.ok) {
                    throw new Error(`GitHub API request for repositories failed: ${reposResponse.status}`);
                }
                totalRepos = await reposResponse.json();
            }

            const startIndex = (page - 1) * perPage;
            const endIndex = startIndex + perPage;
            const displayedRepos = totalRepos.slice(startIndex, endIndex);

            displayedRepos.forEach((item) => {
                const repoLink = document.createElement("a");
                repoLink.classList.add("repo");
                repoLink.href = item.html_url;
                repoLink.target = "_blank";
                repoLink.textContent = item.name;
                reposContainer.appendChild(repoLink);
            });

            createPaginationLinks(page, Math.ceil(totalRepos.length / perPage));
        } catch (error) {
            console.error("Error fetching repositories:", error.message);
        }
    };

    const createPaginationLinks = (currentPage, totalPages) => {
        const pagination = document.getElementById("pagination");
        pagination.innerHTML = "";

        for (let i = 1; i <= totalPages; i++) {
            const link = document.createElement("a");
            link.href = "#";
            link.innerText = i;
            if (i === currentPage) {
                link.classList.add("active");
            }
            link.addEventListener("click", (event) => {
                event.preventDefault();
                const pageNumber = parseInt(event.target.innerText, 10);
                getUser(document.getElementById("search").value.trim(), pageNumber, parseInt(document.getElementById("perPage").value, 10));
            });
            pagination.appendChild(link);
        }
    };

    const form = document.getElementById("form");
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const searchBox = document.getElementById("search");
        const pageNumberInput = document.getElementById("pageNumber");
        const perPageInput = document.getElementById("perPage");

        const username = searchBox.value.trim();
        const pageNumber = parseInt(pageNumberInput.value, 10);
        const perPage = parseInt(perPageInput.value, 10);

        if (username !== "" && !isNaN(pageNumber) && pageNumber >= 1 && !isNaN(perPage) && perPage >= 1) {
            getUser(username, pageNumber, perPage);
        }
    });
});