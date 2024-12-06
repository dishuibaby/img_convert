// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const previewContainer = document.getElementById('previewContainer');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const downloadBtn = document.getElementById('downloadBtn');

let originalImage = null;

// 上传区域点击事件
uploadArea.addEventListener('click', () => {
    imageInput.click();
});

// 处理文件拖放
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#007AFF';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#ddd';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#ddd';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
    }
});

// 处理文件选择
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleImageUpload(file);
    }
});

// 处理图片上传
function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage = new Image();
        originalImage.src = e.target.result;
        originalImage.onload = () => {
            originalPreview.src = originalImage.src;
            originalSize.textContent = formatFileSize(file.size);
            compressImage();
            previewContainer.style.display = 'block';
        };
    };
    reader.readAsDataURL(file);
}

// 压缩图片
function compressImage() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 计算新的尺寸
    let newWidth = originalImage.width;
    let newHeight = originalImage.height;
    
    // 如果图片尺寸大于1920px，按比例缩小
    const maxDimension = 1920;
    if (newWidth > maxDimension || newHeight > maxDimension) {
        if (newWidth > newHeight) {
            newHeight = Math.round((newHeight * maxDimension) / newWidth);
            newWidth = maxDimension;
        } else {
            newWidth = Math.round((newWidth * maxDimension) / newHeight);
            newHeight = maxDimension;
        }
    }
    
    // 设置canvas尺寸为新的尺寸
    canvas.width = newWidth;
    canvas.height = newHeight;
    
    // 使用双线性插值算法进行缩放
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // 绘制图片
    ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);
    
    // 获取文件类型
    const fileType = originalImage.src.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
    
    // 根据文件类型和质量设置进行压缩
    const quality = qualitySlider.value / 100;
    const compressedDataUrl = canvas.toDataURL(fileType, quality);
    
    // 更新预览
    compressedPreview.src = compressedDataUrl;
    
    // 计算压缩后的文件大小
    const base64Length = compressedDataUrl.length - `data:${fileType};base64,`.length;
    const compressedFileSizeBytes = base64Length * 0.75;
    
    // 如果压缩后比原图还大，尝试使用JPEG格式和更低的质量
    if (compressedFileSizeBytes > originalImage.size && fileType === 'image/png') {
        const jpegDataUrl = canvas.toDataURL('image/jpeg', Math.min(quality, 0.85));
        const jpegBase64Length = jpegDataUrl.length - 'data:image/jpeg;base64,'.length;
        const jpegFileSizeBytes = jpegBase64Length * 0.75;
        
        if (jpegFileSizeBytes < compressedFileSizeBytes) {
            compressedPreview.src = jpegDataUrl;
            compressedSize.textContent = formatFileSize(jpegFileSizeBytes);
            return;
        }
    }
    
    compressedSize.textContent = formatFileSize(compressedFileSizeBytes);
}

// 质量滑块变化事件
qualitySlider.addEventListener('input', () => {
    qualityValue.textContent = qualitySlider.value + '%';
    if (originalImage) {
        compressImage();
    }
});

// 下载按钮点击事件
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    const fileType = compressedPreview.src.startsWith('data:image/png') ? 'png' : 'jpg';
    const originalFileName = imageInput.files[0]?.name || 'compressed-image';
    const fileName = originalFileName.replace(/\.[^/.]+$/, '') + '-compressed.' + fileType;
    link.download = fileName;
    link.href = compressedPreview.src;
    link.click();
});

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 