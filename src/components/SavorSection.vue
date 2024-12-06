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
  font-size: 4em;
  font-family: 'Helvetica', 'SimHei', 'STHeiti';
}
.sectionBody {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
}

.cover {
  display: inline;
  padding: 10px;
  width: 22%;
  height: 25%;
  overflow: hidden;
}

.content {
  color: #f3f3f3;
  margin: 3px 2px;
  display: flex;
  align-items: baseline;
}

.rating {
  float: right;
  color: #f0f0f0;
  display: flex;
  align-items: center;
}

.score {
  color: #f0f0f0;
  font-size: 12px;
}

.star {
  color: gold;
  margin-left: 3px;
  font-size: 10px;
}

.title {
  font-size: 0.8em;
  color: #f0f0f0;
  width: 85%;
  letter-spacing: 0.06em;
  font-family: 'Helvetica', 'SimHei', 'STHeiti';
  line-height: 1.3em;
}

@media only screen and (max-width: 768px) {
  .cover {
    width: 27%;
  }
}

.coverImg {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
  border-radius: 5px;
}

/* HTML: <div class="loader"></div> */
.loading {
  width: 45px;
  margin: auto;
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

</style>
