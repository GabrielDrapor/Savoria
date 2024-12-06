<script>
export default {
  props: {
    savor: Object,
  },
};
</script>

<template>
  <div class="section">
    <div class="sectionTitle">{{ savor.title || "" }}</div>
    <div class="sectionBody">
      <div class="loading" v-if="!savor.completedItems.length"></div>
      <div class="cover" v-for="completedItem in savor.completedItems">
        <img class="coverImg" :src="completedItem.item.cover_image_url" />
        <div class="content">
          <div class="title">{{ completedItem.item.display_title }}</div>
          <div v-if="completedItem.rating_grade > 0" class="rating">
            <span class="score">{{ completedItem.rating_grade / 2  }}</span>
            <span class="star">★</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sectionTitle {
  color: #f3f3f3;
  font-size: 3.5em;
  font-weight: 300;
  margin-bottom: 1.5rem;
  font-family: 'Space Grotesk', 'Helvetica Neue', 'SimHei', 'STHeiti';
  letter-spacing: -0.02em;
  opacity: 0.9;
}

.sectionBody {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 25px;
  width: 100%;
}

.cover {
  position: relative;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  aspect-ratio: 2/3;
}

.cover:hover {
  transform: translateY(-8px);
}

.coverImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.cover:hover .coverImg {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

.content {
  margin-top: 12px;
  color: #f3f3f3;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.rating {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.score {
  color: #f3f3f3;
  font-size: 13px;
  font-weight: 500;
  font-family: 'Space Grotesk', sans-serif;
}

.star {
  color: #FFD700;
  margin-left: 3px;
  font-size: 11px;
  filter: drop-shadow(0 0 2px rgba(255, 215, 0, 0.4));
}

.title {
  font-size: 0.95em;
  color: #f3f3f3;
  flex: 1;
  letter-spacing: 0.01em;
  font-family: 'Space Grotesk', 'Helvetica Neue', 'SimHei', 'STHeiti';
  line-height: 1.4;
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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

@media only screen and (max-width: 768px) {
  .sectionBody {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 20px;
  }
  
  .sectionTitle {
    font-size: 2.5em;
  }
  
  .title {
    font-size: 0.9em;
  }
}

</style>
