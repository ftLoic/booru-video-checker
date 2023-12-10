<template>
  <div
    :class="{
      'bg-red-500': item.result.mode == 'error',
      'bg-orange-500': item.result.mode == 'warning',
      'bg-blue-400': item.result.mode == 'valid'
    }"
    class="text-white text-[14px] rounded shadow-md"
  >
    <div class="flex p-4">
      <CloseCircle v-if="item.result.mode == 'error'" :size="36" title="Error" />
      <AlertCircle v-else-if="item.result.mode == 'warning'" :size="36" title="Warning" />
      <CheckCircle v-else :size="36" title="Valid" />

      <div class="ml-4">
        <h4 class="text-base tracking-wide font-bold mb-1">{{ item.flag.name.toUpperCase() }}</h4>

        <span v-html="item.flag.description.replace(/\n/g, '<br>')"></span>

        <div class="mt-1">
          Expected {{ item.flag.name }}:
          <pre class="inline px-[6px] py-[2px] bg-[#00000015] rounded text-[14px]">{{ item.flag.expected }}</pre>
          <br />Video's {{ item.flag.name }}:
          <pre class="inline px-[6px] py-[2px] bg-[#00000015] rounded text-[14px]">{{ item.result.arg }}</pre>
        </div>
      </div>
    </div>

    <div v-if="item.flag.ffmpeg" class="bg-[#00000015] p-4">
      FFMPEG option:
      <pre class="inline px-2 py-1 bg-[#00000015] rounded">{{ item.flag.ffmpeg }}</pre>
    </div>
  </div>
</template>

<script>
import CloseCircle from "vue-material-design-icons/CloseCircle.vue";
import AlertCircle from "vue-material-design-icons/AlertCircle.vue";
import CheckCircle from "vue-material-design-icons/CheckCircle.vue";

export default {
  props: ["item"],
  components: {
    CloseCircle,
    AlertCircle,
    CheckCircle
  }
};
</script>
