// Array of daily prompts for journal entries
const dailyPrompts = [
    "What made you smile today?",
    "Describe a moment when you felt proud of yourself.",
    "What's something new you learned recently?",
    "Write about a person who positively impacted your day.",
    "What are you most grateful for right now?",
    "Describe a challenge you overcame today.",
    "What's one thing you're looking forward to?",
    "Write about a small victory or accomplishment.",
    "What would you tell your past self from a year ago?",
    "Describe a moment of peace or calm you experienced.",
    "What's something that inspired you recently?",
    "Write about a goal you're working toward.",
    "What's a lesson you learned from a mistake?",
    "Describe something beautiful you noticed today.",
    "What's one way you showed kindness to yourself or others?"
];

// Array of celebration emojis for successful submissions
const celebrationEmojis = ['🎉', '🌟', '✨', '🎊', '🌻', '🐣', '🦋', '🌈', '💫', '🎈', '🌺', '🍀'];

// Get today's date in YYYY-MM-DD format
function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Get yesterday's date in YYYY-MM-DD format
function getYesterdayDate() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
}

// Format date for display (e.g., "Monday, June 24, 2025")
function formatDateForDisplay(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Get or generate daily prompt (same prompt for the same day)
function getDailyPrompt() {
    const today = getTodayDate();
    const storedPrompt = localStorage.getItem(`prompt_${today}`);
    
    if (storedPrompt) {
        return storedPrompt;
    }
    
    // Generate a consistent prompt for today based on date
    const dateNum = new Date(today).getDate();
    const promptIndex = dateNum % dailyPrompts.length;
    const prompt = dailyPrompts[promptIndex];
    
    // Store the prompt for today
    localStorage.setItem(`prompt_${today}`, prompt);
    return prompt;
}

// Get current streak data from localStorage
function getStreakData() {
    const lastDate = localStorage.getItem('lastJournalDate');
    const currentStreak = parseInt(localStorage.getItem('currentStreak')) || 0;
    
    return { lastDate, currentStreak };
}

// Calculate and update streak based on submission
function updateStreak() {
    const today = getTodayDate();
    const { lastDate, currentStreak } = getStreakData();
    
    // If this is the first entry ever
    if (!lastDate) {
        localStorage.setItem('lastJournalDate', today);
        localStorage.setItem('currentStreak', '1');
        return 1;
    }
    
    // If user already submitted today, don't change streak
    if (lastDate === today) {
        return currentStreak;
    }
    
    // If user submitted yesterday, increment streak
    if (lastDate === getYesterdayDate()) {
        const newStreak = currentStreak + 1;
        localStorage.setItem('lastJournalDate', today);
        localStorage.setItem('currentStreak', newStreak.toString());
        return newStreak;
    }
    
    // If user skipped days, reset streak to 1
    localStorage.setItem('lastJournalDate', today);
    localStorage.setItem('currentStreak', '1');
    return 1;
}

// Display current streak in the UI
function displayStreak() {
    const { currentStreak } = getStreakData();
    const streakDisplay = document.getElementById('streak-display');
    
    if (currentStreak === 0) {
        streakDisplay.textContent = 'Start your journaling streak today!';
    } else if (currentStreak === 1) {
        streakDisplay.textContent = 'Current streak: 1 day';
    } else {
        streakDisplay.textContent = `Current streak: ${currentStreak} days`;
    }
}

// Save journal entry to localStorage
function saveJournalEntry(content) {
    const today = getTodayDate();
    const entries = getJournalEntries();
    
    entries[today] = {
        content: content,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('journalEntries', JSON.stringify(entries));
}

// Get all journal entries from localStorage
function getJournalEntries() {
    const entries = localStorage.getItem('journalEntries');
    return entries ? JSON.parse(entries) : {};
}

// Display previous journal entries
function displayPreviousEntries() {
    const entries = getJournalEntries();
    const entriesList = document.getElementById('entries-list');
    
    // Clear existing entries
    entriesList.innerHTML = '';
    
    // Get entries sorted by date (newest first)
    const sortedDates = Object.keys(entries).sort().reverse();
    
    if (sortedDates.length === 0) {
        entriesList.innerHTML = '<div class="no-entries">No previous entries yet. Start writing!</div>';
        return;
    }
    
    // Display last 5 entries to keep the UI clean
    const recentDates = sortedDates.slice(0, 5);
    
    recentDates.forEach(date => {
        const entry = entries[date];
        const entryElement = document.createElement('div');
        entryElement.className = 'entry-item';
        
        entryElement.innerHTML = `
            <div class="entry-date">${formatDateForDisplay(date)}</div>
            <div class="entry-content">${entry.content}</div>
        `;
        
        entriesList.appendChild(entryElement);
    });
    
    // Show a note if there are more entries
    if (sortedDates.length > 5) {
        const moreNote = document.createElement('div');
        moreNote.className = 'no-entries';
        moreNote.textContent = `... and ${sortedDates.length - 5} more entries`;
        entriesList.appendChild(moreNote);
    }
}

// Show success message with random emoji
function showSuccessMessage() {
    const successMessage = document.getElementById('success-message');
    const successEmoji = document.getElementById('success-emoji');
    const successText = document.getElementById('success-text');
    
    // Pick random emoji
    const randomEmoji = celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)];
    successEmoji.textContent = randomEmoji;
    
    // Show the message
    successMessage.classList.remove('hidden');
    
    // Hide after 3 seconds
    setTimeout(() => {
        successMessage.classList.add('hidden');
    }, 3000);
}

// Handle form submission
function handleSubmit() {
    const textarea = document.getElementById('journal-entry');
    const submitBtn = document.getElementById('submit-btn');
    const content = textarea.value.trim();
    
    // Validate input
    if (!content) {
        alert('Please write something before submitting!');
        return;
    }
    
    // Disable button to prevent double submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    try {
        // Save the entry
        saveJournalEntry(content);
        
        // Update streak
        const newStreak = updateStreak();
        
        // Update UI
        displayStreak();
        displayPreviousEntries();
        
        // Clear the textarea
        textarea.value = '';
        
        // Show success message
        showSuccessMessage();
        
        // Update success text based on streak
        const successText = document.getElementById('success-text');
        if (newStreak === 1) {
            successText.textContent = 'Great start! Your journaling streak begins!';
        } else {
            successText.textContent = `Awesome! ${newStreak} day streak maintained!`;
        }
        
    } catch (error) {
        console.error('Error saving journal entry:', error);
        alert('There was an error saving your entry. Please try again.');
    } finally {
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Entry';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set up the daily prompt
    const promptElement = document.getElementById('daily-prompt');
    promptElement.textContent = getDailyPrompt();
    
    // Display current streak
    displayStreak();
    
    // Display previous entries
    displayPreviousEntries();
    
    // Set up event listeners
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.addEventListener('click', handleSubmit);
    
    // Allow submit with Ctrl+Enter
    const textarea = document.getElementById('journal-entry');
    textarea.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.key === 'Enter') {
            handleSubmit();
        }
    });
    
    // Auto-resize textarea
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });
    
    console.log('Daily Journal app initialized successfully!');
});

// Utility function to export journal data (for backup purposes)
function exportJournalData() {
    const entries = getJournalEntries();
    const streakData = getStreakData();
    
    const exportData = {
        entries: entries,
        streak: streakData,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `journal-backup-${getTodayDate()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Make export function available globally for debugging/backup
window.exportJournalData = exportJournalData;
