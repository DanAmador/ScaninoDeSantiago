import { useState, useEffect, useRef } from 'react';

export type SplatDataset = {
    clip: { center: [number, number, number]; radius: number; };
    offset: [number, number, number];
    scale: number
    id: string, name: string, ratio: number
}


// Hook to read and update splats.json
const useSplatData = (pollInterval = 5000) => {
    const [splats, setSplats] = useState<SplatDataset[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Store a reference to the current data for comparison later
    const dataRef = useRef<SplatDataset[]>(splats);

    // Function to fetch data
    const fetchData = async () => {
        try {
            const response = await fetch('/splats.json');
            if (!response.ok) {
                throw new Error('Failed to fetch splats.json');
            }
            const result: SplatDataset[] = await response.json();

            // Only update if the data has changed
            if (JSON.stringify(result) !== JSON.stringify(dataRef.current)) {
                setSplats(result);
                dataRef.current = result;
            }
            setLoading(false);
        } catch (error: any) {
            setError(error.message);
            setLoading(false);
        }
    };

    // Initial data load
    useEffect(() => {
        fetchData(); // Load data on initial render

        // Set up polling to check for changes
        const intervalId = setInterval(() => {
            fetchData();
        }, pollInterval);

        // Cleanup the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, [pollInterval]);

    // Method to update the data
    const updateSplat = async (updatedSplat: Partial<SplatDataset>) => {
        try {
            const response = await fetch('/api/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedSplat),
            });

            if (!response.ok) {
                throw new Error('Failed to update the splat');
            }

            // Optionally, you can update the state here as well
            const updatedData = splats.map((splat) =>
                splat.id === updatedSplat.id ? { ...splat, ...updatedSplat } : splat
            );
            setSplats(updatedData);
            dataRef.current = updatedData; // Update the reference data as well
        } catch (error: any) {
            setError(error.message);
        }
    };

    return { splats, updateSplat, loading, error };
};

export default useSplatData;
