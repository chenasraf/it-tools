<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Dimensions, ResizeMode } from './image-resizer.service'
import { computeTargetDimensions, resizeImage } from './image-resizer.service'

const sourceFile = ref<File | null>(null)
const sourceUrl = ref('')
const sourceDimensions = ref<Dimensions | null>(null)
const error = ref('')

const mode = ref<ResizeMode>('percentage')
const stretchWidth = ref(800)
const stretchHeight = ref(600)
const percentage = ref(50)
const widthOnly = ref(800)
const heightOnly = ref(600)
const quality = ref(0.92)

const resizedUrl = ref('')
const resizedBlob = ref<Blob | null>(null)
const resizedDimensions = ref<Dimensions | null>(null)
const isResizing = ref(false)

const outputMimeType = computed(() => {
  const mime = sourceFile.value?.type
  if (mime && ['image/png', 'image/jpeg', 'image/webp'].includes(mime)) {
    return mime
  }
  return 'image/png'
})

const previewTargetDimensions = computed<Dimensions | null>(() => {
  if (!sourceDimensions.value) {
    return null
  }
  return computeTargetDimensions({
    mode: mode.value,
    source: sourceDimensions.value,
    stretch: { width: stretchWidth.value, height: stretchHeight.value },
    percentage: percentage.value,
    width: widthOnly.value,
    height: heightOnly.value,
  })
})

function clearOutput() {
  if (resizedUrl.value) {
    URL.revokeObjectURL(resizedUrl.value)
  }
  resizedUrl.value = ''
  resizedBlob.value = null
  resizedDimensions.value = null
}

function clearSource() {
  if (sourceUrl.value) {
    URL.revokeObjectURL(sourceUrl.value)
  }
  sourceFile.value = null
  sourceUrl.value = ''
  sourceDimensions.value = null
  clearOutput()
}

function onUpload(file: File) {
  if (!file.type.startsWith('image/')) {
    error.value = 'Selected file is not an image.'
    return
  }

  clearSource()
  error.value = ''
  sourceFile.value = file
  sourceUrl.value = URL.createObjectURL(file)

  const img = new Image()
  img.onload = () => {
    sourceDimensions.value = { width: img.naturalWidth, height: img.naturalHeight }
    stretchWidth.value = img.naturalWidth
    stretchHeight.value = img.naturalHeight
    widthOnly.value = img.naturalWidth
    heightOnly.value = img.naturalHeight
  }
  img.onerror = () => {
    error.value = 'Could not load the selected image.'
  }
  img.src = sourceUrl.value
}

async function applyResize() {
  if (!sourceUrl.value || !sourceDimensions.value || !previewTargetDimensions.value) {
    return
  }
  clearOutput()
  isResizing.value = true
  error.value = ''

  try {
    const img = new Image()
    img.src = sourceUrl.value
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Could not decode source image'))
    })

    const blob = await resizeImage({
      image: img,
      target: previewTargetDimensions.value,
      mimeType: outputMimeType.value,
      quality: outputMimeType.value === 'image/png' ? undefined : quality.value,
    })

    resizedBlob.value = blob
    resizedUrl.value = URL.createObjectURL(blob)
    resizedDimensions.value = previewTargetDimensions.value
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to resize image.'
  } finally {
    isResizing.value = false
  }
}

function downloadResized() {
  if (!resizedUrl.value || !sourceFile.value) {
    return
  }
  const ext =
    outputMimeType.value.split('/')[1] === 'jpeg' ? 'jpg' : outputMimeType.value.split('/')[1]
  const base = sourceFile.value.name.replace(/\.[^.]+$/, '') || 'image'
  const a = document.createElement('a')
  a.href = resizedUrl.value
  a.download = `${base}-resized.${ext}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

watch([mode, stretchWidth, stretchHeight, percentage, widthOnly, heightOnly], () => {
  clearOutput()
})
</script>

<template>
  <div flex flex-col gap-3>
    <c-card>
      <c-file-upload
        v-if="!sourceUrl"
        accept="image/*"
        title="Drag and drop an image here, or click to select an image"
        @file-upload="onUpload"
      />

      <div v-else>
        <div flex flex-col items-center gap-3>
          <img
            :src="sourceUrl"
            alt="Selected image"
            style="max-width: 100%; max-height: 320px; border-radius: 4px"
          />
          <div text-sm op-70>
            {{ sourceFile?.name }} — {{ sourceDimensions?.width }} ×
            {{ sourceDimensions?.height }} px
          </div>
          <c-button @click="clearSource"> Choose another image </c-button>
        </div>
      </div>

      <c-alert v-if="error" type="error" mt-3>
        {{ error }}
      </c-alert>
    </c-card>

    <c-card v-if="sourceDimensions" title="Resize options">
      <c-buttons-select
        v-model:value="mode"
        label="Mode"
        label-width="100px"
        :options="[
          { label: 'Fixed size (stretch)', value: 'stretch' },
          { label: 'By percentage', value: 'percentage' },
          { label: 'By width (keep ratio)', value: 'width' },
          { label: 'By height (keep ratio)', value: 'height' },
        ]"
        mb-3
      />

      <div v-if="mode === 'stretch'">
        <n-form-item label="Width (px)">
          <n-input-number v-model:value="stretchWidth" :min="1" placeholder="Width" w-full />
        </n-form-item>
        <n-form-item label="Height (px)">
          <n-input-number v-model:value="stretchHeight" :min="1" placeholder="Height" w-full />
        </n-form-item>
      </div>

      <div v-else-if="mode === 'percentage'">
        <n-form-item label="Percentage (%)">
          <n-input-number
            v-model:value="percentage"
            :min="1"
            :max="1000"
            placeholder="Percentage"
            w-full
          />
        </n-form-item>
      </div>

      <div v-else-if="mode === 'width'">
        <n-form-item label="Width (px)">
          <n-input-number v-model:value="widthOnly" :min="1" placeholder="Width" w-full />
        </n-form-item>
      </div>

      <div v-else-if="mode === 'height'">
        <n-form-item label="Height (px)">
          <n-input-number v-model:value="heightOnly" :min="1" placeholder="Height" w-full />
        </n-form-item>
      </div>

      <div v-if="outputMimeType !== 'image/png'">
        <n-form-item :label="`Quality (${Math.round(quality * 100)}%)`">
          <n-slider v-model:value="quality" :min="0.1" :max="1" :step="0.01" />
        </n-form-item>
      </div>

      <div mb-3 text-sm op-70>
        Output will be {{ previewTargetDimensions?.width }} ×
        {{ previewTargetDimensions?.height }} px ({{ outputMimeType }})
      </div>

      <div flex justify-center gap-3>
        <c-button :loading="isResizing" @click="applyResize"> Resize image </c-button>
      </div>
    </c-card>

    <c-card v-if="resizedUrl && resizedDimensions" title="Result">
      <div flex flex-col items-center gap-3>
        <img
          :src="resizedUrl"
          alt="Resized image"
          style="max-width: 100%; max-height: 320px; border-radius: 4px"
        />
        <div text-sm op-70>{{ resizedDimensions.width }} × {{ resizedDimensions.height }} px</div>
        <c-button @click="downloadResized"> Download </c-button>
      </div>
    </c-card>
  </div>
</template>
