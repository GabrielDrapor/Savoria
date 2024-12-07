<script>
export default {
  data() {
    return {
      categoryItems: {
        book: [],
        screen: [],
        music: [],
        game: []
      },
      categories: {
        book: "I read",
        screen: "I watched",
        music: "I listened",
        game: "I played",
      },
      scrollSpeeds: {
        book: 1,
        screen: 1,
        music: 1,
        game: 1
      },
      isReducedMotion: false
    };
  },
  methods: {
    async getCompletedItems(type) {
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? "http://localhost:9527"
        : "";
      const req = await fetch(baseUrl + `/api/complete/${type}`);
      const resp_json = await req.json();
      return resp_json.data;
    },
    async getScreenItems() {
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? "http://localhost:9527"
        : "";
      const req = await fetch(baseUrl + `/api/complete/screen`);
      const resp_json = await req.json();
      return resp_json.data;
    },
    async getAllItems() {
      const types = ['book', 'music', 'game'];
      for (let type of types) {
        const items = await this.getCompletedItems(type);
        this.categoryItems[type] = items;
      }
      
      const screenItems = await this.getScreenItems();
      this.categoryItems.screen = screenItems;

      this.$nextTick(() => {
        this.checkReducedMotion();
        const tracks = document.querySelectorAll('.itemsTrack');
        tracks.forEach(track => {
          track.addEventListener('scroll', this.handleScrollPosition, { passive: true });
        });
      });
    },
    handleScroll(category, event) {
      if (this.isReducedMotion) return;
      
      const speed = Math.abs(event.deltaX) / 50;
      this.scrollSpeeds[category] = Math.min(Math.max(1, speed), 3);
      
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
      
      this.scrollTimeout = setTimeout(() => {
        this.scrollSpeeds[category] = 1;
      }, 1000);
    },
    handleScrollPosition(event) {
      const track = event.target;
      const scrollWidth = track.scrollWidth / 3;
      
      if (track.scrollLeft >= scrollWidth * 2) {
        track.scrollLeft = scrollWidth;
      } else if (track.scrollLeft <= 0) {
        track.scrollLeft = scrollWidth;
      }
    },
    checkReducedMotion() {
      this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      this.isReducedMotion = this.isReducedMotion || window.innerWidth < 768;
    }
  },
  mounted() {
    this.getAllItems();
  },
  beforeUnmount() {
    const tracks = document.querySelectorAll('.itemsTrack');
    tracks.forEach(track => {
      track.removeEventListener('scroll', this.handleScrollPosition);
    });
  }
};
</script>

<template>
  <h1 class="pageTitle">In {{ new Date().getFullYear() }},</h1>

  <div class="rowsContainer">
    <div 
      v-for="(items, category) in categoryItems" 
      :key="category"
      class="categoryRow"
    >
      <h2 class="categoryTitle">{{ categories[category] }}</h2>
      <div 
        class="itemsTrack" 
        @wheel="handleScroll(category, $event)"
        :style="{ '--scroll-speed': scrollSpeeds[category] }"
      >
        <!-- Show loading placeholders when no items -->
        <div v-if="!items.length" class="loadingRow">
          <div v-for="n in 8" :key="n" class="loadingItem">
            <div class="loadingShimmer"></div>
          </div>
        </div>
        <!-- Show actual items when loaded -->
        <div v-else class="itemsInner">
          <template v-for="n in (isReducedMotion ? 2 : 6)" :key="n">
            <div 
              v-for="(item, index) in items" 
              :key="category + n + index" 
              class="floatingItem"
            >
              <img 
                class="coverImg" 
                :src="item.item.cover_image_url" 
                :alt="item.item.display_title"
                loading="lazy"
              />
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.pageTitle {
  color: #f3f3f3;
  font-size: 5.5em;
  font-weight: 300;
  margin: 2rem 0 2rem;
  font-family: 'Space Grotesk', 'Helvetica Neue', 'SimHei', 'STHeiti';
  letter-spacing: -0.03em;
  background: linear-gradient(to right, #fff, #c4c4ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  z-index: 2;
  text-align: center;
  width: 100%;
}

.rowsContainer {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100vw;
  margin-left: calc((100vw - 100%) / -2);
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.categoryRow {
  position: relative;
  padding: 2rem 0;
}

.categoryTitle {
  color: #f3f3f3;
  font-size: 2.5em;
  font-weight: 300;
  margin-bottom: 1.5rem;
  opacity: 0.8;
  text-align: center;
  width: 100%;
  position: relative;
  padding: 0;
}

.itemsTrack {
  overflow-x: auto;
  overflow-y: visible;
  margin: 0 -20px;
  mask-image: linear-gradient(
    to right,
    transparent,
    black 5%,
    black 95%,
    transparent
  );
  cursor: grab;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: auto;
  padding: 2rem 0;
  margin-top: -2rem;
  margin-bottom: -2rem;
}

.itemsTrack::-webkit-scrollbar {
  display: none;
}

.itemsTrack:active {
  cursor: grabbing;
}

.itemsInner {
  display: flex;
  gap: 15px;
  padding: 0 20px;
  min-width: max-content;
  will-change: transform;
  animation: autoScroll 120s linear infinite;
  animation-play-state: running;
  animation-duration: calc(120s / var(--scroll-speed, 1));
}

@keyframes autoScroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-16.666%));
  }
}

.itemsTrack:hover .itemsInner {
  animation-play-state: paused;
}

.itemsTrack:active .itemsInner {
  animation-play-state: paused;
}

.floatingItem {
  width: 120px;
  flex-shrink: 0;
  aspect-ratio: 2/3;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  transform-origin: center center;
  padding: 1rem 0;
  margin: -1rem 0;
}

.floatingItem:hover {
  transform: scale(1.2);
  z-index: 10;
}

.coverImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  will-change: transform;
}

.floatingItem:hover .coverImg {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7);
}

.loading {
  width: 45px;
  margin: 2rem auto;
  aspect-ratio: 1;
  --c: no-repeat linear-gradient(#fff 0 0);
  background: 
    var(--c) 0%   50%,
    var(--c) 50%  50%,
    var(--c) 100% 50%;
  background-size: 20% 100%;
  animation: l1 1s infinite linear;
}

@keyframes l1 {
  0%  {background-size: 20% 100%,20% 100%,20% 100%}
  33% {background-size: 20% 10% ,20% 100%,20% 100%}
  50% {background-size: 20% 100%,20% 10% ,20% 100%}
  66% {background-size: 20% 100%,20% 100%,20% 10% }
  100%{background-size: 20% 100%,20% 100%,20% 100%}
}

.rowsContainer::-webkit-scrollbar {
  height: 8px;
}

.rowsContainer::-webkit-scrollbar-track {
  background: transparent;
}

.rowsContainer::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  border: 2px solid transparent;
}

.rowsContainer::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.loadingRow {
  display: flex;
  gap: 15px;
  padding: 0 20px;
  min-width: max-content;
}

.loadingItem {
  width: 120px;
  aspect-ratio: 2/3;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.loadingShimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@media only screen and (max-width: 768px) {
  .pageTitle {
    font-size: 3.5em;
    margin: 1.5rem 0 1.5rem;
  }
  
  .rowsContainer {
    gap: 25px;
  }

  .categoryTitle {
    font-size: 2em;
    margin-bottom: 1.2rem;
  }
  
  .floatingItem {
    width: 90px;
  }

  .itemsInner {
    gap: 12px;
  }

  .loadingItem {
    width: 100px;
  }
}

@media (prefers-reduced-motion: reduce), (max-width: 768px) {
  .itemsInner {
    animation: none;
  }
  
  .floatingItem:hover {
    transform: none;
  }
  
  .coverImg {
    transform: none;
    transition: none;
  }
}
</style>
