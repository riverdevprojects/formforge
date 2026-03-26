/**
 * Data Recovery — Pre-built form template definition.
 * Mirrors the seed data in backend/server.js.
 */
export const dataRecoveryTemplate = {
  name: 'Data Recovery Intake',
  description: 'Help us understand your data recovery situation.',
  slug: 'data-recovery',
  business_name: 'DataRescue Labs',
  accent_color: '#7c3aed',
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
        label: 'What type of drive needs recovery?',
        field: 'drive_type',
        required: true,
        options: ['Internal HDD', 'Internal SSD', 'External HDD', 'External SSD', 'USB Flash Drive', 'Memory Card'],
      },
    },
    {
      id: 'step-5',
      type: 'text',
      config: {
        label: 'What data needs to be recovered?',
        placeholder: 'e.g. Family photos, work documents, client files...',
        field: 'data_description',
        required: true,
        multiline: true,
      },
    },
    {
      id: 'step-6',
      type: 'multichoice',
      config: {
        label: 'What happened to the drive?',
        field: 'failure_reason',
        required: true,
        options: ['Accidentally deleted', 'Drive fell/dropped', 'Water damage', "Won't mount/be recognized", 'Making noise', 'Unknown'],
      },
    },
    {
      id: 'step-7',
      type: 'audio',
      config: {
        label: 'Record the sound of your drive.',
        hint: "Press record and place your device near the drive while it's powered on. Let it record for 10–15 seconds of the drive attempting to spin up. This helps us diagnose the problem remotely.",
        field: 'drive_audio',
        required: false,
        maxMinutes: 2,
      },
    },
    {
      id: 'step-8',
      type: 'photo',
      config: {
        label: 'Photo of the drive label/sticker.',
        hint: 'Show the model number and serial number clearly.',
        field: 'photo_label',
        required: true,
        maxSizeMB: 10,
      },
    },
    {
      id: 'step-9',
      type: 'photo',
      config: {
        label: 'Photo of any visible physical damage.',
        hint: 'Scratches, cracks, burn marks, connector damage.',
        field: 'photo_damage',
        required: false,
        maxSizeMB: 10,
      },
    },
    {
      id: 'step-10',
      type: 'multichoice',
      config: {
        label: 'What operating system was it connected to?',
        field: 'operating_system',
        required: true,
        options: ['Mac', 'Windows', 'Linux', 'Other'],
      },
    },
    {
      id: 'step-11',
      type: 'multichoice',
      config: {
        label: 'Approximate data size?',
        field: 'data_size',
        required: false,
        options: ['Under 100GB', '100–500GB', '500GB–2TB', 'Over 2TB', "Don't know"],
      },
    },
  ],
};
