document.addEventListener("dragover", (event) => {
    event.preventDefault();
});

function updateBar(bar, clientX) {
  const barWrapper = bar.parentElement;
  const barWidth = clientX - barWrapper.getBoundingClientRect().left;
  const containerWidth = barWrapper.clientWidth;
  let newValue = Math.max(0, Math.min(10, Math.round(barWidth / (containerWidth / 10))));

  bar.style.width = `${newValue * 10}%`;
  bar.dataset.value = newValue;
  bar.querySelector('span').textContent = newValue;
}

document.querySelectorAll('.bar-wrapper').forEach(wrapper => {
  wrapper.addEventListener('dragstart', (e) => {
    const emptyImage = new Image();
    e.dataTransfer.setDragImage(emptyImage, 0, 0);
    e.dataTransfer.setData('text/plain', null);
  });

  wrapper.addEventListener('drag', (e) => {
    let bar = e.target.className === "bar" ? e.target : e.target.querySelector(".bar");
    updateBar(bar, e.clientX);
  });

  wrapper.addEventListener('click', (e) => {
    let bar = e.target.className === "bar" ? e.target : e.target.querySelector(".bar");
    updateBar(bar, e.clientX);
  });
});
