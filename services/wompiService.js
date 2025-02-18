export const initializeSubscription = async (planData) => {
    try {
        console.log('Datos enviados a init-subscription:', planData); // Debugging

        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}wompi/init-subscription`, 
            {
                planId: planData.planId,
                customerData: planData.customerData,
                amount: planData.amount,
                frequency: planData.frequency
            }, 
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        console.log('Respuesta de init-subscription:', response.data); // Debugging

        if (!response.data.success) {
            throw new Error(response.data.error || 'Error en la inicialización de la suscripción');
        }

        return {
            success: true,
            amountInCents: response.data.amountInCents,
            reference: response.data.reference,
            publicKey: response.data.publicKey
        };
    } catch (error) {
        console.error("Error en initializeSubscription:", {
            message: error.message,
            response: error.response?.data,
            data: error.response?.data
        });
        
        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        throw new Error("No se pudo iniciar la suscripción");
    }
};

export const processSubscription = async (subscriptionData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/wompi/process-subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(subscriptionData)
        });

        return await response.json();
    } catch (error) {
        console.error('Error procesando suscripción:', error);
        throw error;
    }
};