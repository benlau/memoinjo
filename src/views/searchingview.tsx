import React from "react";
import { Note } from "../services/joplindataservice";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
const MAX_NOTES = 50;

export function SearchingView({ popupService, onBackClicked }) {
    const [notes, setNotes] = React.useState<Note[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const loadNotes = async () => {
            setIsLoading(true);
            const count = await popupService.searchRelatedNotes(
                popupService.currentTab.url,
                MAX_NOTES,
                (foundNotes) => {
                    setNotes(foundNotes);
                },
            );
            if (count === 0) {
                setNotes([]);
            }
            setIsLoading(false);
        };

        loadNotes();
    }, [popupService]);

    return (
        <div>
            <div className="flex flex-row items-center">
                <a
                    href="#"
                    className="text-[#212529] no-underline hover:text-[#7f212529] visited:text-[#7f212529] active:text-[#7f212529]"
                    onClick={(e) => {
                        e.preventDefault();
                        onBackClicked();
                    }}
                >
                    <ArrowLeftIcon />
                </a>
                <span className="ml-1">Related Memos</span>
            </div>
            <div className="mt-2">
                {isLoading ? (
                    <div>Loading...</div>
                ) : notes.length === 0 ? (
                    <div>No memo found</div>
                ) : (
                    notes.map((note) => (
                        <div key={note.id} className="searching-view-item">
                            <a
                                href={`joplin://x-callback-url/openNote?id=${note.id}`}
                            >
                                {note.title}
                            </a>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
