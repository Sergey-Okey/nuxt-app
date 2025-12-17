<template>
  <div class="test-page">
    <!-- Header -->
    <header class="test-header">
      <h1 class="test-title">Components Test</h1>
      <p class="test-subtitle">Task Manager Design System</p>
    </header>

    <div class="test-container">
      <!-- 1. Buttons Section -->
      <section class="test-section">
        <h2 class="test-section-title">Buttons</h2>
        <div class="test-grid">
          <!-- Button variants -->
          <div class="test-card">
            <h3>Variants</h3>
            <div class="test-row">
              <Button variant="primary" label="Primary" />
              <Button variant="secondary" label="Secondary" />
              <Button variant="ghost" label="Ghost" />
              <Button variant="text" label="Text" />
              <Button variant="danger" label="Danger" />
            </div>
          </div>

          <!-- Button sizes -->
          <div class="test-card">
            <h3>Sizes</h3>
            <div class="test-row">
              <Button size="xs" label="Extra Small" />
              <Button size="sm" label="Small" />
              <Button size="md" label="Medium" />
              <Button size="lg" label="Large" />
              <Button size="xl" label="Extra Large" />
            </div>
          </div>

          <!-- Button states -->
          <div class="test-card">
            <h3>States</h3>
            <div class="test-row">
              <Button label="Normal" />
              <Button label="Disabled" disabled />
              <Button label="Loading" loading />
              <Button label="Full Width" full-width />
            </div>
          </div>

          <!-- Button with icons -->
          <div class="test-card">
            <h3>With Icons</h3>
            <div class="test-row">
              <Button icon-left="plus" label="Add" />
              <Button icon-right="arrow-right" label="Continue" />
              <Button icon-left="trash" variant="danger" label="Delete" />
              <Button icon="settings" icon-only />
              <Button icon="bell" circle />
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Inputs Section -->
      <section class="test-section">
        <h2 class="test-section-title">Inputs</h2>
        <div class="test-grid">
          <!-- Basic inputs -->
          <div class="test-card">
            <h3>Basic Inputs</h3>
            <div class="test-column">
              <Input label="Text Input" placeholder="Enter text..." />
              <Input
                label="With Icon"
                icon-left="search"
                placeholder="Search..."
              />
              <Input label="Disabled" value="Disabled field" disabled />
              <Input label="Error State" error="This field is reqred" />
            </div>
          </div>

          <!-- Input variations -->
          <div class="test-card">
            <h3>Variations</h3>
            <div class="test-column">
              <Input size="sm" label="Small" placeholder="Small input" />
              <Input size="lg" label="Large" placeholder="Large input" />
              <Input
                label="Clearable"
                clearable
                placeholder="Type to clear"
                v-model="inputValue"
              />
              <Input
                label="Textarea"
                is-textarea
                placeholder="Multi-line text..."
                :rows="3"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Cards Section -->
      <section class="test-section">
        <h2 class="test-section-title">Cards</h2>
        <div class="test-grid">
          <!-- Card variants -->
          <Card title="Default Card" class="test-card">
            <p>This is a default card with some content inside.</p>
            <template #actions>
              <Button variant="text" label="Action 1" />
              <Button variant="primary" label="Action 2" />
            </template>
          </Card>

          <Card title="Outline Card" variant="outline" class="test-card">
            <p>Card with outline variant.</p>
          </Card>

          <Card title="Flat Card" variant="flat" class="test-card">
            <p>Card with flat styling.</p>
          </Card>

          <Card
            title="Clickable Card"
            clickable
            hoverable
            class="test-card"
            @click="handleCardClick"
          >
            <p>Clickable card with hover effect.</p>
          </Card>
        </div>
      </section>

      <!-- 4. Checkboxes Section -->
      <section class="test-section">
        <h2 class="test-section-title">Checkboxes</h2>
        <div class="test-grid">
          <div class="test-card">
            <h3>Basic Checkboxes</h3>
            <div class="test-column">
              <Checkbox label="Unchecked" />
              <Checkbox label="Checked" :model-value="true" />
              <Checkbox label="Disabled" disabled />
              <Checkbox label="Indeterminate" indeterminate />
            </div>
          </div>

          <div class="test-card">
            <h3>Checkbox Group</h3>
            <div class="test-column">
              <Checkbox
                v-for="option in checkboxOptions"
                :key="option.value"
                :label="option.label"
                v-model="checkedValues"
                :value="option.value"
              />
            </div>
            <p class="test-note">Selected: {{ checkedValues.join(', ') }}</p>
          </div>
        </div>
      </section>

      <!-- 5. Progress Section -->
      <section class="test-section">
        <h2 class="test-section-title">Progress</h2>
        <div class="test-grid">
          <div class="test-card">
            <h3>Linear Progress</h3>
            <div class="test-column">
              <Progress :model-value="25" label="Low" />
              <Progress :model-value="50" label="Medium" variant="warning" />
              <Progress :model-value="75" label="High" variant="success" />
              <Progress :model-value="90" label="Critical" variant="error" />
              <Progress
                :model-value="45"
                label="With Buffer"
                :buffer-value="65"
                show-buffer
              />
              <Progress label="Indeterminate" indeterminate />
              <Progress :model-value="60" striped animated label="Animated" />
            </div>
          </div>

          <div class="test-card">
            <h3>Circular Progress</h3>
            <div class="test-row">
              <Progress :model-value="25" shape="circle" />
              <Progress :model-value="50" shape="circle" variant="success" />
              <Progress :model-value="75" shape="circle" variant="warning" />
              <Progress :model-value="100" shape="circle" variant="error" />
            </div>
          </div>
        </div>
      </section>

      <!-- 6. Badges Section -->
      <section class="test-section">
        <h2 class="test-section-title">Badges</h2>
        <div class="test-grid">
          <div class="test-card">
            <h3>Badge Variants</h3>
            <div class="test-row">
              <Badge label="Default" />
              <Badge label="Primary" variant="primary" />
              <Badge label="Success" variant="success" />
              <Badge label="Warning" variant="warning" />
              <Badge label="Error" variant="error" />
              <Badge label="Info" variant="info" />
            </div>
          </div>

          <div class="test-card">
            <h3>Badge Sizes & Shapes</h3>
            <div class="test-row">
              <Badge label="XS" size="xs" />
              <Badge label="SM" size="sm" />
              <Badge label="MD" size="md" />
              <Badge label="LG" size="lg" />
              <Badge label="Pill" shape="pill" />
              <Badge shape="dot" />
            </div>
          </div>

          <div class="test-card">
            <h3>Badge with Icons</h3>
            <div class="test-row">
              <Badge icon="bell" label="Notifications" />
              <Badge icon="check" label="Completed" variant="success" />
              <Badge icon="alert" label="Warning" variant="warning" closable />
              <Badge icon="star" icon-only />
            </div>
          </div>
        </div>
      </section>

      <!-- 7. Modal Test Button -->
      <section class="test-section">
        <h2 class="test-section-title">Modal</h2>
        <div class="test-card">
          <Button
            variant="primary"
            label="Open Modal"
            @click="showModal = true"
          />
        </div>
      </section>
    </div>

    <!-- Modal Component -->
    <Modal
      v-model="showModal"
      title="Test Modal"
      subtitle="This is a test modal"
    >
      <p>This modal demonstrates the modal component functionality.</p>
      <p>
        You can add any content here including forms, images, or other
        components.
      </p>

      <template #footer>
        <Button variant="text" label="Cancel" @click="showModal = false" />
        <Button variant="primary" label="Confirm" @click="showModal = false" />
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Test data for components
const inputValue = ref('')
const showModal = ref(false)
const checkedValues = ref<string[]>([])

const checkboxOptions = [
  { value: 'option-1', label: 'Option 1' },
  { value: 'option-2', label: 'Option 2' },
  { value: 'option-3', label: 'Option 3' },
]

const handleCardClick = () => {
  console.log('Card clicked!')
}
</script>

<style lang="scss" scoped>
.test-page {
  padding: var(--space-6);
  max-width: 1200px;
  margin: 0 auto;
  background: var(--primary-bg);
  min-height: 100vh;
}

.test-header {
  margin-bottom: var(--space-8);
  text-align: center;
  padding: var(--space-8) 0;
  border-bottom: 1px solid var(--border-light);
}

.test-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.test-subtitle {
  font-size: var(--text-lg);
  color: var(--text-secondary);
}

.test-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.test-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.test-section-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--border-light);
}

.test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-4);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.test-card {
  background: var(--card-bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-base);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  h3 {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin: 0;
  }
}

.test-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
}

.test-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.test-note {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid var(--border-light);
}

// Responsive adjustments
@media (max-width: 640px) {
  .test-page {
    padding: var(--space-4);
  }

  .test-title {
    font-size: var(--text-2xl);
  }

  .test-card {
    padding: var(--space-4);
  }

  .test-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
