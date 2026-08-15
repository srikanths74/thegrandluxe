/**
 * Formspree API Integration Utility
 * Dispatches reservation and inquiry form submissions to Formspree
 */
export async function sendFormspreeNotification(formData: Record<string, unknown>): Promise<boolean> {
  const customUrl = process.env.NEXT_PUBLIC_FORMSPREE_URL;
  const customEndpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;
  const formId = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID || 'mrenjnjr';

  // Determine Formspree Endpoint URL
  let endpoint = customUrl || customEndpoint || `https://formspree.io/f/${formId}`;
  
  if (!endpoint || endpoint.includes('YOUR_FORMSPREE_FORM_ID')) {
    endpoint = 'https://formspree.io/f/mrenjnjr';
  }

  console.log('[Formspree API] Submitting form data to endpoint:', endpoint);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      console.log('[Formspree API] Submission sent successfully!');
      return true;
    } else {
      console.warn('[Formspree API] Response status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('[Formspree API] Network error:', error);
    return false;
  }
}
