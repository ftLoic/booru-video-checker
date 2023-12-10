import CheckerService from "./CheckerService";

export default [
  {
    name: "Format",
    description: "Your video should be encoded in x264 (AVC). HEVC isn't supported natively by most browsers and VP8 or VP9 aren't compatible with some devices (i.e. Apple devices)",
    expected: "AVC",
    ffmpeg: "-c:v libx264",
    check: CheckerService.formatCheck
  },
  {
    name: "Aspect Ratio",
    description: "Except for some exotic aspect ratios (like movies), the aspect ratio of your video should be 640x480 (4:3) or 854x480 (16:9).",
    expected: "640x480 or 854x480",
    ffmpeg: '-vf "scale=<width>:480"',
    check: CheckerService.aspectRatioCheck
  },
  {
    name: "Pixel Aspect Ratio",
    description: "The pixel aspect ratio of your video should be 1.",
    expected: "1",
    ffmpeg: '-vf "scale=-2:480, setsar=1:1"',
    check: CheckerService.pixelAspectRatioCheck
  },
  {
    name: "Framerate",
    description: "Except for some rare cases, animated shows are made in 24 frames per second (precisely 23.976024, following the NTSC standard).",
    expected: "≈ 23.976024",
    check: CheckerService.framerateCheck
  },
  {
    name: "Constant Framerate",
    description: "[WARNING: This might be a false positive by mediainfo]\nAnimated shows are made with a constant framerate (CFR) of 24 frames par second (precisely 23.976024, following the NTSC standard). Except for some rare cases, variable framerate (VFR) shouldn't be used.",
    expected: "CFR",
    check: CheckerService.constantFramerateCheck
  },
  {
    name: "ScanType",
    description: "Your video should use a Progressive scanning, and not an Interlaced scanning.",
    expected: "Progressive",
    check: CheckerService.scanTypeCheck
  },
  {
    name: "audio tracks",
    description: "Your video shouldn't have an audio track.",
    expected: "0",
    ffmpeg: "-an",
    check: CheckerService.audioTrackCheck
  },
  {
    name: "Profile",
    description: "The profile of your video should only be Baseline, Main or High to avoid compatibility problems (particularly with non-Chromium-based or mobile browsers). This might be related to the Chroma Subsampling/Bit Depth of your video.",
    expected: "Baseline, Main or High",
    check: CheckerService.profileCheck
  },
  {
    name: "Bit Depth",
    description: "Your video should be 8-bit to avoid compatibility problems (particularly with non-Chromium-based or mobile browsers).",
    expected: "8",
    ffmpeg: "-pix_fmt yuv420p",
    check: CheckerService.bitCheck
  },
  {
    name: "Chroma Subsampling",
    description: "Your video should have a Chroma subsampling of 4:2:0 to avoid compatibility problems (particularly with non-Chromium-based or mobile browsers).",
    expected: "4:2:0",
    ffmpeg: "-pix_fmt yuv420p",
    check: CheckerService.chromaSubsamplingCheck
  },
  {
    name: "Rate Control",
    description: "In order to preserve video quality, the rate control of your video should be Constant Rate Factor (CRF). Constant Bit Rate (CBR) is strongly discouraged.",
    expected: "crf",
    ffmpeg: "-crf <crf>",
    check: CheckerService.rateControlCheck
  },
  {
    name: "Buffering Verifier",
    description: "In order to preserve video quality, the maximum bit rate/buffer size of your video should be removed",
    expected: "Max. Bit Rate: None / Max. Buffer Size: None",
    check: CheckerService.bufferingVerifierCheck
  },
  {
    name: "CRF",
    description: "The recommended Constant Rate Factor (CRF) should be 16 or less.",
    expected: "≤ 16",
    ffmpeg: "-crf <crf>",
    check: CheckerService.crfCheck
  },
  {
    name: "Preset",
    description: "Your video should be encoded with a slower preset for best weight/quality results.",
    expected: "veryslow or placebo",
    ffmpeg: "-preset <preset>",
    check: CheckerService.presetCheck
  },
  {
    name: "Deblock",
    description: "High deblock values should be avoided, as this means more smoothing and less risk of blocking artefacts. The x264 tune options might affect the deblock values.",
    expected: "≤ 1:1:1",
    check: CheckerService.deblockCheck
  },
  {
    name: "AQ Mode",
    description: "Your video should be encoded with an AQ mode of 3, as this handles dark scenes better and helps to prevent color banding/blocking.",
    expected: "3",
    ffmpeg: "-x264-params aq-mode=3",
    check: CheckerService.aqModeCheck
  },
  {
    name: "AQ Strength",
    description: "The AQ Strength of your video isn't within the recommended limits. The x264 tune options might affect the AQ Strength value.",
    expected: "0.7 ≥ aq_strength ≥ 1",
    check: CheckerService.aqStrengthCheck
  },
  {
    name: "Color Space",
    description: "The color space of your video should be tagged as BT.709, except for some exceptions (like DVD releases). The color space of a 480p video will be assumed incorrectly by the browser if they're not tagged.",
    expected: "BT.709 / BT.709 / BT.709",
    ffmpeg: "-color_primaries bt709 -color_trc bt709 -colorspace bt709",
    check: CheckerService.colorSpaceCheck
  }
];
