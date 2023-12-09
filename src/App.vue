<template>
  <header class="bg-blue-400 text-white p-10 py-6 text-xl font-bold">
    <h1>Booru Video Checker</h1>
  </header>

  <main class="bg-slate-100">
    <div class="bg-white">
      <div class="max-w-[1000px] m-auto px-4 py-10">
        <div class="bg-blue-100 border-blue-400 border-4 border-dashed p-6 w-full text-center text-blue-400 font-bold text-lg cursor-pointer rounded" @dragover.prevent @drop.prevent="dropFile" @click.self="$refs.file.click()">
          Click or drop a file here!
          <video class="mt-6 m-auto h-[360px] rounded cursor-auto shadow-md" ref="video" muted autoplay loop controls @click="videoClick"></video>
          <input class="hidden" type="file" ref="file" accept="video/*" @change="changeFile" />
        </div>
      </div>
    </div>

    <div class="max-w-[1000px] m-auto px-4 py-10 text-[#333]">
      <h4 class="text-xl font-bold">Report:</h4>

      <NoticeItem v-for="item of sortedFlags" :item="item" v-bind:key="item.flag.name" class="mt-6"></NoticeItem>

      <div v-if="unknownFlags.length > 0" class="mt-5">Some parameters couldn't be checked: {{ unknownFlags.join(", ") }}. They might not be accessible with the codec of your video.</div>
    </div>
  </main>

  <footer class="bg-blue-400 text-white p-10">
    Made with 💖 with
    <a class="font-bold hover:underline" href="https://github.com/buzz/mediainfo.js" target="_blank">mediainfo.js</a>
    by
    <a class="font-bold hover:underline" href="https://twitter.com/ftLoic" target="_blank">Loïc</a>
  </footer>
</template>

<script>
import flagsList from "./services/flags";
import CheckerService from "./services/CheckerService";
import NoticeItem from "./components/NoticeItem.vue";
import MediaInfoFactory from "mediainfo.js";

export default {
  components: {
    NoticeItem
  },
  data() {
    return {
      file: null,
      flags: [],
      unknownFlags: []
    };
  },
  computed: {
    sortedFlags() {
      const values = {
        error: 2,
        warning: 1,
        valid: 0
      };

      const newFlags = [...this.flags].sort((a, b) => {
        if (values[a.result.mode] < values[b.result.mode]) {
          return 1;
        }
        if (values[a.result.mode] > values[b.result.mode]) {
          return -1;
        }
        return 0;
      });

      return newFlags;
    }
  },
  methods: {
    videoClick() {
      if (!this.$refs.video.src) {
        this.$refs.file.click();
      }
    },
    dropFile(e) {
      this.addFile(e.dataTransfer.files[0]);
    },
    changeFile() {
      this.addFile(this.$refs.file.files[0]);
    },
    async addFile(file) {
      this.unknownFlags = [];
      this.flags = [];

      const mediainfo = await MediaInfoFactory({ locateFile: () => "MediaInfoModule.wasm" });

      this.$refs.video.src = URL.createObjectURL(file);

      const getSize = () => file.size;
      const readChunk = (chunkSize, offset) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target.error) {
              reject(event.target.error);
            }
            resolve(new Uint8Array(event.target.result));
          };
          reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize));
        });

      mediainfo
        .analyzeData(getSize, readChunk)
        .then((result) => {
          this.analyze(result?.media?.track);
        })
        .catch((error) => {
          console.error(error.stack);
        });
    },
    analyze(tracks) {
      console.log("Tracks:", tracks);

      this.unknownFlags = [];
      this.flags = [];

      for (let flag of flagsList) {
        const result = flag.check(CheckerService, tracks);

        if (result) {
          this.flags.push({
            flag,
            result
          });
        } else {
          this.unknownFlags.push(flag.name);
        }
      }
    }
  }
};
</script>
