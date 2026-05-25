import { createContext } from "react";
import type { SampleTest, SampleTestGroup } from "../types";

export const StagingAreaContext = createContext({

    tests: [] as SampleTest[],
    groups: [] as SampleTestGroup[],
    selectedTestsToAdd: new Set<number>(),
    adding: false,
    showModal: false,
    loading: false,
    error: false,


    refresh: async () => {},

    toggleSelect: (id: number) => {},
    handleAdd: async (groupId: number) => {},	
    handleRemove: async (testId: number) => {},
    handleDeleteGroup: async (groupId: number) => {},
    handleUnschedule: async (taskId: number) => {},
    handleCreateGroupWithTests: async (templateIds: number[]) => {},
    setShowModal: (_: boolean) => {},
    setSelectedTestsToAdd: (_: Set<number>) => {},    

})
