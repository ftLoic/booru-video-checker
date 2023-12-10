class CheckerService {
  getTrack(tracks, wanted) {
    return tracks.find((t) => t["@type"] === wanted);
  }
  getTracks(tracks, wanted) {
    return tracks.filter((t) => t["@type"] === wanted);
  }
  getx264Args(settings) {
    const args = {};
    for (let setting of settings.split(" / ")) {
      const line = setting.split("=");
      args[line[0]] = line[1];
    }

    return args;
  }

  audioTrackCheck(service, tracks) {
    const audioTracks = service.getTracks(tracks, "Audio").length;

    return {
      mode: audioTracks == 0 ? "valid" : "error",
      arg: audioTracks ?? "0"
    };
  }

  rateControlCheck(service, tracks) {
    const video = service.getTrack(tracks, "Video");
    if (!video.Encoded_Library_Settings) {
      return;
    }

    const rcArg = service.getx264Args(video.Encoded_Library_Settings).rc;
    if (!rcArg) {
      return;
    }

    return {
      mode: rcArg === "crf" ? "valid" : "error",
      arg: rcArg
    };
  }

  bufferingVerifierCheck(service, tracks) {
    const video = service.getTrack(tracks, "Video");
    if (!video.Encoded_Library_Settings) {
      return;
    }

    const args = service.getx264Args(video.Encoded_Library_Settings);

    return {
      mode: !args.vbv_maxrate && !args.vbv_bufsize ? "valid" : "error",
      arg: `Max. Bit Rate: ${args.vbv_maxrate ?? "None"} / Max. Buffer Size: ${args.vbv_bufsize ?? "None"}`
    };
  }

  crfCheck(service, tracks) {
    const video = service.getTrack(tracks, "Video");
    if (!video.Encoded_Library_Settings) {
      return;
    }

    const crfArg = parseInt(service.getx264Args(video.Encoded_Library_Settings).crf);
    if (isNaN(crfArg)) {
      return;
    }

    return {
      mode: crfArg <= 16 ? "valid" : "error",
      arg: crfArg ?? "UNKNOWN"
    };
  }

  formatCheck(service, tracks) {
    const video = service.getTrack(tracks, "Video");

    return {
      mode: video.Format == "AVC" ? "valid" : "error",
      arg: video.Format ?? "UNKNOWN"
    };
  }

  aspectRatioCheck(service, tracks) {
    const video = service.getTrack(tracks, "Video");

    return {
      mode: (video.Width == "854" && video.Height == "480") || (video.Width == "640" && video.Height == "480") ? "valid" : "warning",
      arg: video.Width + "x" + video.Height
    };
  }

  pixelAspectRatioCheck(service, tracks) {
    const video = service.getTrack(tracks, "Video");

    return {
      mode: Math.abs(1 - video.PixelAspectRatio) <= 0.004 ? "valid" : "error",
      arg: video.PixelAspectRatio
    };
  }

  framerateCheck(service, tracks) {
    const video = service.getTrack(tracks, "Video");
    if (!video.FrameRate) {
      return;
    }

    return {
      mode: video.FrameRate.toFixed() == "24" ? "valid" : "error",
      arg: video.FrameRate
    };
  }

  constantFramerateCheck(service, tracks) {
    const video = service.getTrack(tracks, "Video");
    if (!video.FrameRate_Mode) {
      return;
    }

    return {
      mode: video.FrameRate_Mode == "CFR" ? "valid" : "error",
      arg: video.FrameRate_Mode
    };
  }

  scanTypeCheck(service, tracks) {
    const video = service.getTrack(tracks, "Video");
    if (!video.ScanType) {
      return;
    }

    return {
      mode: video.ScanType == "Progressive" ? "valid" : "error",
      arg: video.ScanType
    };
  }

  presetCheck(service, tracks) {
    const video = service.getTrack(tracks, "Video");
    if (!video.Encoded_Library_Settings) {
      return;
    }

    const args = service.getx264Args(video.Encoded_Library_Settings);

    let preset, mode;

    if (args.chroma_qp_offset == 0 && args.me == "dia" && args.subme == 0 && args.trellis == 0) {
      preset = "ultrafast";
      mode = "error";
    } else if (args.chroma_qp_offset == 0 && args.me == "dia" && args.subme == 1 && args.trellis == 0) {
      preset = "superfast";
      mode = "error";
    } else if (args.chroma_qp_offset == 0 && args.me == "hex" && args.subme == 2 && args.trellis == 0) {
      preset = "veryfast";
      mode = "error";
    } else if (args.chroma_qp_offset == 0 && args.me == "hex" && args.subme == 4 && args.trellis == 1) {
      preset = "faster";
      mode = "error";
    } else if (args.chroma_qp_offset == -2 && args.me == "hex" && args.subme == 6 && args.trellis == 1) {
      preset = "fast";
      mode = "error";
    } else if (args.chroma_qp_offset == -2 && args.me == "hex" && args.subme == 7 && args.trellis == 1) {
      preset = "medium";
      mode = "warning";
    } else if (args.chroma_qp_offset == -2 && args.me == "hex" && args.subme == 8 && args.trellis == 2) {
      preset = "slow";
      mode = "warning";
    } else if (args.chroma_qp_offset == -2 && args.me == "umh" && args.subme == 9 && args.trellis == 2) {
      preset = "slower";
      mode = "warning";
    } else if (args.chroma_qp_offset == -2 && args.me == "umh" && args.subme == 10 && args.trellis == 2) {
      preset = "veryslow";
      mode = "valid";
    } else if (args.chroma_qp_offset == -2 && args.me == "tesa" && args.subme == 11 && args.trellis == 2) {
      preset = "placebo";
      mode = "valid";
    } else if (args.chroma_qp_offset == -2 && (args.me == "tesa" || args.me == "umh") && args.subme >= 10 && args.trellis == 2) {
      // other cases but common parameters w/ veryslow/placebo
      preset = "probably veryslow or placebo";
      mode = "valid";
    } else {
      // no preset detected
      return;
    }

    return {
      mode: mode,
      arg: preset
    };
  }

  deblockCheck(service, tracks) {
    const video = service.getTrack(tracks, "Video");
    if (!video.Encoded_Library_Settings) {
      return;
    }

    const deblockArg = service.getx264Args(video.Encoded_Library_Settings).deblock;
    if (!deblockArg) {
      return;
    }

    const deblockValues = deblockArg.split(":").map(parseFloat);
    if (deblockValues.length < 2) {
      return;
    }

    return {
      mode: !(deblockValues[0] >= 1 && deblockValues[1] >= 1) ? "valid" : "warning",
      arg: deblockArg
    };
  }

  aqModeCheck(service, tracks) {
    const video = service.getTrack(tracks, "Video");
    if (!video.Encoded_Library_Settings) {
      return;
    }

    const aqArg = service.getx264Args(video.Encoded_Library_Settings).aq;
    if (!aqArg) {
      return;
    }

    return {
      mode: aqArg.startsWith("3") ? "valid" : "warning",
      arg: aqArg[0]
    };
  }

  aqStrengthCheck(service, tracks) {
    const video = service.getTrack(tracks, "Video");
    if (!video.Encoded_Library_Settings) {
      return;
    }

    const aqArg = service.getx264Args(video.Encoded_Library_Settings).aq;
    if (!aqArg) {
      return;
    }

    const aqValues = aqArg.split(":").map(parseFloat);
    if (aqValues.length < 2) {
      return;
    }

    return {
      mode: aqValues[1] >= 0.7 && aqValues[1] <= 1 ? "valid" : "warning",
      arg: aqValues[1]
    };
  }

  colorSpaceCheck(service, tracks) {
    const video = service.getTrack(tracks, "Video");

    return {
      mode: video.colour_primaries == "BT.709" && video.transfer_characteristics == "BT.709" && video.matrix_coefficients == "BT.709" ? "valid" : "error",
      arg: (video.colour_primaries ?? "UNKNOWN") + " / " + (video.transfer_characteristics ?? "UNKNOWN") + " / " + (video.matrix_coefficients ?? "UNKNOWN")
    };
  }

  chromaSubsamplingCheck(service, tracks) {
    const video = service.getTrack(tracks, "Video");
    if (!video.ChromaSubsampling) {
      return;
    }

    return {
      mode: video.ChromaSubsampling === "4:2:0" ? "valid" : "error",
      arg: video.ChromaSubsampling
    };
  }

  profileCheck(service, tracks) {
    const video = service.getTrack(tracks, "Video");
    if (!video.Format_Profile) {
      return;
    }

    return {
      mode: (video.Format_Profile == "Baseline" || video.Format_Profile == "Main" || video.Format_Profile == "High") ? "valid" : "error",
      arg: video.Format_Profile
    };
  }

  bitCheck(service, tracks) {
    const video = service.getTrack(tracks, "Video");
    if (!video.BitDepth) {
      return;
    }

    return {
      mode: video.BitDepth === 8 ? "valid" : "error",
      arg: video.BitDepth
    };
  }
}

export default new CheckerService();
