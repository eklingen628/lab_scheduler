
export async function get(input: string) {
    const url = import.meta.env.VITE_API_URL + input

    try {
        const res = await fetch(url)
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json()
        return data
    } catch (error) {
        console.error("Fetch failed:", error);
    }

}


