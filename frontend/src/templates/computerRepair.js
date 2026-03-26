/**
 * Computer / Device Repair — Pre-built form template definition.
 * Mirrors the seed data in backend/server.js.
 */
export const computerRepairTemplate = {
  name: 'Device Repair Intake',
  description: 'Tell us about your device so we can help you faster.',
  slug: 'device-repair',
  business_name: 'TechFix Pro',
  accent_color: '#1d4ed8',
  steps: [
    {
      id: 'step-1',
      type: 'text',
      config: {
        label: "What's your name?",
        placeholder: 'Full name',
        field: 'client_name',
        required: true,
        validation: 'name',
      },
    },
    {
      id: 'step-2',
      type: 'text',
      config: {
        label: 'Best email to reach you?',
        placeholder: 'you@email.com',
        field: 'email',
        required: true,
        validation: 'email',
      },
    },
    {
      id: 'step-3',
      type: 'text',
      config: {
        label: 'Phone number',
        placeholder: '(555) 000-0000',
        field: 'phone',
        required: false,
        validation: 'phone',
      },
    },
    {
      id: 'step-4',
      type: 'multichoice',
      config: {
        label: 'What type of device needs repair?',
        field: 'device_type',
        required: true,
        options: ['MacBook', 'Windows Laptop', 'Desktop PC', 'iPhone', 'iPad', 'Other'],
      },
    },
    {
      id: 'step-5',
      type: 'text',
      config: {
        label: "Describe what's happening with your device.",
        placeholder: "e.g. Screen cracked, won't turn on, running slow...",
        field: 'problem_description',
        required: true,
        multiline: true,
      },
    },
    {
      id: 'step-6',
      type: 'multichoice',
      config: {
        label: 'How long has this been happening?',
        field: 'issue_duration',
        required: true,
        options: ['Just started', 'Few days', 'Over a week', 'Over a month'],
      },
    },
    {
      id: 'step-7',
      type: 'multichoice',
      config: {
        label: 'Has the device been dropped or had liquid damage?',
        field: 'physical_damage',
        required: true,
        options: ['Yes – dropped', 'Yes – liquid damage', 'No'],
      },
    },
    {
      id: 'step-8',
      type: 'photo',
      config: {
        label: 'Take a photo of the front of your device.',
        hint: 'Make sure the whole screen is visible.',
        field: 'photo_front',
        required: true,
        maxSizeMB: 10,
      },
    },
    {
      id: 'step-9',
      type: 'photo',
      config: {
        label: 'Take a photo showing the damage or issue (if visible).',
        hint: 'Get as close as possible.',
        field: 'photo_damage',
        required: false,
        maxSizeMB: 10,
      },
    },
    {
      id: 'step-10',
      type: 'text',
      config: {
        label: 'Anything else we should know?',
        placeholder: 'Optional additional details...',
        field: 'additional_notes',
        required: false,
        multiline: true,
      },
    },
  ],
};
