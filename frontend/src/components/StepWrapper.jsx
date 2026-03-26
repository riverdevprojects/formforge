import { useEffect, useRef, useState } from 'react';

export default function StepWrapper({ stepKey, direction, children }) {
  const [visible, setVisible] = useState(false);
  const prevKey = useRef(null);

  useEffect(() => {
    if (prevKey.current !== stepKey) {
      setVisible(false);
      const t = setTimeout(() => setVisible(true), 20);
      prevKey.current = stepKey;
      return () => clearTimeout(t);
    }
    setVisible(true);
  }, [stepKey]);

  const translateIn = direction === 'backward' ? '-40px' : '40px';

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : `translateX(${translateIn})`,
        transition: 'opacity 300ms ease, transform 300ms ease',
      }}
    >
      {children}
    </div>
  );
}
