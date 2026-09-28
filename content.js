let currentVideo = null;
let isChangingVideo = false;

function findNextButton() {
    return [...document.querySelectorAll("button")]
        .find(button => button.innerText.trim() === "Next");
}

function getVideos() {
    return [...document.querySelectorAll("video")];
}

function pauseAllExcept(videoToKeep) {
    getVideos().forEach(video => {
        if (video !== videoToKeep && !video.paused) {
            video.pause();
            console.log("Paused old video");
        }
    });
}

function setupVideo(video) {
    if (!video || video === currentVideo) {
        return;
    }

    currentVideo = video;

    console.log("Current video detected");

    video.addEventListener("ended", () => {
        if (isChangingVideo) {
            return;
        }

        console.log("VIDEO ENDED");

        const nextButton = findNextButton();

        if (!nextButton) {
            console.log("Next button not found");
            return;
        }

        isChangingVideo = true;

        const oldVideo = video;

        console.log("Clicking Next...");
        nextButton.click();

        waitForNextVideo(oldVideo);
    });
}

function waitForNextVideo(oldVideo) {
    let attempts = 0;

    const interval = setInterval(() => {
        attempts++;

        const video = document.querySelector("video.vjs-tech");

        if (video && video !== oldVideo && video.duration > 0) {
            clearInterval(interval);

            console.log("Next Video.js video detected");

            video.pause();
            video.currentTime = 0;

            console.log("Resetting new video to 0");

            video.play()
                .then(() => {
                    console.log("NEXT VIDEO PLAYING FROM 0:00");
                    isChangingVideo = false;
                })
                .catch(error => {
                    console.log("PLAY ERROR:", error);
                    isChangingVideo = false;
                });

            setupVideo(video);
            return;
        }

        if (attempts >= 20) {
            clearInterval(interval);
            console.log("Could not find next Video.js video");
            isChangingVideo = false;
        }
    }, 500);
}

function findVideo() {
    const videos = getVideos();

    const video = videos.find(video =>
        !video.ended &&
        video.duration > 0
    );

    if (video) {
        setupVideo(video);
    }
}

const observer = new MutationObserver(() => {
    findVideo();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

findVideo();