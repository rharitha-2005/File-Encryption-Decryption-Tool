const fileInput = document.getElementById('fileInput');
const keyInput = document.getElementById('keyInput');
const encryptBtn = document.getElementById('encryptBtn');
const decryptBtn = document.getElementById('decryptBtn');
const message = document.getElementById('message');

let fileData = null;
let fileName = '';

function updateButtons() {
  const enabled = fileData && keyInput.value.length > 0;
  encryptBtn.disabled = !enabled;
  decryptBtn.disabled = !enabled;
}

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) {
    fileData = null;
    fileName = '';
    updateButtons();
    return;
  }
  fileName = file.name;
  const reader = new FileReader();
  reader.onload = () => {
    fileData = new Uint8Array(reader.result);
    updateButtons();
    message.textContent = `Loaded file: ${fileName} (${fileData.length} bytes)`;
  };
  reader.readAsArrayBuffer(file);
});

keyInput.addEventListener('input', updateButtons);

function xorData(data, key) {
  const keyBytes = new TextEncoder().encode(key);
  const output = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    output[i] = data[i] ^ keyBytes[i % keyBytes.length];
  }
  return output;
}

function downloadFile(data, name) {
  const blob = new Blob([data]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

encryptBtn.addEventListener('click', () => {
  if (!fileData || !keyInput.value) {
    message.textContent = 'Please select a file and enter a password.';
    return;
  }
  message.textContent = 'Encrypting...';
  const encrypted = xorData(fileData, keyInput.value);
  const encryptedName = fileName + '.xorenc';
  downloadFile(encrypted, encryptedName);
  message.textContent = `Encrypted file saved as "${encryptedName}"`;
});

decryptBtn.addEventListener('click', () => {
  if (!fileData || !keyInput.value) {
    message.textContent = 'Please select a file and enter a password.';
    return;
  }
  message.textContent = 'Decrypting...';
  const decrypted = xorData(fileData, keyInput.value);
  let decryptedName = fileName.replace(/\.xorenc$/, '');
  if (decryptedName === fileName) decryptedName = fileName + '.decrypted';
  downloadFile(decrypted, decryptedName);
  message.textContent = `Decrypted file saved as "${decryptedName}"`;
});
