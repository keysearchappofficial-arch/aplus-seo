window.UIProgress = (() => {
  function create(options = {}) {
    const {
      render,
      initialPercent = 8,
      steps = [],
      interval = 700,
      finishingText = "正在整理輸出內容...",
      finishedText = "生成完成"
    } = options;

    let timer = null;
    let currentPercent = initialPercent;
    let currentText = steps[0]?.text || "";

    function update(percent, text) {
      currentPercent = percent;
      currentText = text;
      if (typeof render === "function") {
        render(currentPercent, currentText);
      }
    }

    function start() {
      stop();

      currentPercent = initialPercent;
      let stepIndex = 0;

      if (steps.length) {
        update(currentPercent, steps[stepIndex].text);
      }

      timer = setInterval(() => {
        const step = steps[stepIndex];
        if (!step) return;

        if (currentPercent < step.until) {
          currentPercent += Math.floor(Math.random() * 3) + 1;
          if (currentPercent > step.until) currentPercent = step.until;
        } else if (stepIndex < steps.length - 1) {
          stepIndex += 1;
        }

        update(currentPercent, steps[stepIndex].text);
      }, interval);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function finishSmooth() {
      stop();

      return new Promise((resolve) => {
        let duration = 900;

        if (currentPercent < 40) duration = 1200;
        else if (currentPercent < 70) duration = 900;
        else duration = 600;

        const finalStart = Math.max(currentPercent, 92);
        const start = currentPercent;
        const end = 100;
        const startTime = performance.now();

        function tick(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = Math.round(start + (finalStart - start) * eased);

          update(value, finishingText);

          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            const secondStartTime = performance.now();
            const secondDuration = 260;

            function tickFinal(now2) {
              const elapsed2 = now2 - secondStartTime;
              const progress2 = Math.min(elapsed2 / secondDuration, 1);
              const eased2 = 1 - Math.pow(1 - progress2, 3);
              const value2 = Math.round(finalStart + (end - finalStart) * eased2);

              update(value2, finishedText);

              if (progress2 < 1) {
                requestAnimationFrame(tickFinal);
              } else {
                setTimeout(resolve, 180);
              }
            }

            requestAnimationFrame(tickFinal);
          }
        }

        requestAnimationFrame(tick);
      });
    }

    return {
      start,
      stop,
      finishSmooth,
      getPercent: () => currentPercent,
      getText: () => currentText
    };
  }

  return { create };
})();