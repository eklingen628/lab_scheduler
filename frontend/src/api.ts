
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
        throw error
    }

}

export async function post(input: string, body: object = {}) {
    const url = import.meta.env.VITE_API_URL + input
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return await res.json()
    } catch (error) {
        console.error("Post failed:", error)
        throw error
    }
}

export async function del(input: string) {
    const url = import.meta.env.VITE_API_URL + input
    try {
        const res = await fetch(url, { method: 'DELETE' })
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return await res.json()
    } catch (error) {
        console.error("Delete failed:", error)
        throw error
    }
}

export async function patch(input: string, body: Record<string, unknown>) {
    const url = import.meta.env.VITE_API_URL + input

    try {
        const res = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return await res.json()
    } catch (error) {
        console.error("Patch failed:", error);
        throw error
    }
}



export async function unscheduleTask(taskId: number) {
    await patch(`/tasks/${taskId}`, { person_id: null, scheduled_date: null, position: null });
}
