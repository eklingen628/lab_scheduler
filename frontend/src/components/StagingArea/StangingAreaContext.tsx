import { createContext } from "react";
import type { Person, SampleTest, SampleTestGroup } from "../types";

export const StagingAreaContext = createContext({

    tests: [] as SampleTest[],
    groups: [] as SampleTestGroup[],
    people: [] as Person[],
    selectedTestsToAdd: new Set<number>(),
    adding: false,
    showModal: false,
    loading: false,
    error: false,


    refresh: async () => {},

    toggleSelect: (_id: number) => {},
    handleAdd: async (_groupId: number) => {},	
    handleRemove: async (_testId: number) => {},
    handleDeleteGroup: async (_groupId: number) => {},
    handleUnschedule: async (_taskId: number) => {},
    handleCreateGroupWithTests: async (_templateIds: number[]) => {},
    setShowModal: (_: boolean) => {},
    setSelectedTestsToAdd: (_: Set<number>) => {},    

})
