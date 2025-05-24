const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            message: null,
            reservations: [], // Array para almacenar las reservas
            demo: [
                { title: "FIRST", background: "white", initial: "white" },
                { title: "SECOND", background: "white", initial: "white" }
            ]
        },
        actions: {
            exampleFunction: () => {
                getActions().changeColor(0, "green");
            },

            getReservations: async () => {
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/reservas?fecha=${new Date().toISOString().slice(0,10)}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });

                    if (!response.ok) {
                        console.error("Error al obtener las reservas:", response.status, response.statusText);
                        return false;
                    }

                    const data = await response.json();

                  
                    if (data.reservas) {
                        setStore({ reservations: data.reservas });
                        return data.reservas;
                    } else {
                        console.error("Respuesta inesperada del backend:", data);
                        return false;
                    }
                } catch (error) {
                    console.error("Error al obtener las reservas:", error);
                    return false;
                }
            },

            deleteReservation: async (id) => {
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/reservas`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ reserva_id: id })
                    });

                    if (response.ok) {
                        console.log("Reserva borrada exitosamente");
                    
                        const currentReservations = getStore().reservations;
                        const updatedReservations = currentReservations.filter(r => r.id !== id);
                        setStore({ reservations: updatedReservations });
                        return true;
                    } else {
                        console.error("Error al borrar la reserva:", response.status, response.statusText);
                        return false;
                    }
                } catch (error) {
                    console.error("Error al borrar la reserva:", error);
                    return false;
                }
            },

            submitReservations: async (selectedReservation) => {
             
                try {
                    const response = await fetch(`${process.env.BACKEND_URL}/reservas`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(selectedReservation)
                    });

                    if (!response.ok) {
                        throw new Error(`Error al guardar la reserva: ${response.statusText}`);
                    }

                    const data = await response.json();
                    console.log("Reserva guardada exitosamente:", data);

                    return true;
                } catch (error) {
                    console.error("Error al guardar la reserva:", error);
                    return false;


                }
            }
        }
    };
};

export default getState;
