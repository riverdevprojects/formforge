import TextStep from './TextStep.jsx';
import MultiChoiceStep from './MultiChoiceStep.jsx';
import PhotoStep from './PhotoStep.jsx';
import AudioStep from './AudioStep.jsx';

/**
 * ConditionalStep renders its inner step only if the condition is met.
 * If the condition is not met, it renders nothing and is treated as complete.
 */
export default function ConditionalStep({ config, value, onChange, responses }) {
  const { dependsOn, matchValue, label, field, required, type = 'text', options, placeholder, hint, multiline } = config;

  const parentAnswer = responses[dependsOn];
  const isVisible = Array.isArray(parentAnswer)
    ? parentAnswer.includes(matchValue)
    : parentAnswer === matchValue;

  if (!isVisible) return null;

  // Build inner step config
  const innerConfig = { label, field, required, placeholder, hint, multiline, options };

  switch (type) {
    case 'multichoice':
      return <MultiChoiceStep config={innerConfig} value={value} onChange={onChange} />;
    case 'photo':
      return <PhotoStep config={innerConfig} value={value} onChange={onChange} />;
    case 'audio':
      return <AudioStep config={innerConfig} value={value} onChange={onChange} />;
    default:
      return <TextStep config={innerConfig} value={value} onChange={onChange} />;
  }
}
