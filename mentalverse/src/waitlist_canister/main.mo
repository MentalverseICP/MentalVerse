import Time "mo:base/Time";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Int "mo:base/Int";

persistent actor WaitlistCanister {
    
    // Types
    public type WaitlistEntry = {
        email: Text;
        timestamp: Int;
        principal: ?Principal;
    };

    public type Result<T, E> = Result.Result<T, E>;

    // Stable storage for persistence across upgrades
    private stable var waitlistEntries : [WaitlistEntry] = [];
    private transient var waitlist = Buffer.Buffer<WaitlistEntry>(0);

    // Initialize from stable storage
    system func preupgrade() {
        waitlistEntries := Buffer.toArray(waitlist);
    };

    system func postupgrade() {
        waitlist := Buffer.fromArray(waitlistEntries);
        waitlistEntries := [];
    };

    // Add email to waitlist
    public func addToWaitlist(email: Text) : async Result<Text, Text> {
        // Basic email validation
        if (not isValidEmail(email)) {
            return #err("Invalid email format");
        };

        // Check if email already exists
        let existingEntry = Buffer.toArray(waitlist) |> Array.find<WaitlistEntry>(_, func(entry) = entry.email == email);
        switch (existingEntry) {
            case (?_) { return #err("Email already registered"); };
            case null {};
        };

        // Add new entry
        let newEntry: WaitlistEntry = {
            email = email;
            timestamp = Time.now();
            principal = null; // Can be set later when user authenticates
        };

        waitlist.add(newEntry);
        
        Debug.print("New waitlist entry: " # email);
        #ok("Successfully added to waitlist")
    };

    // Get all waitlist entries (admin function)
    public query func getWaitlistEntries() : async [WaitlistEntry] {
        Buffer.toArray(waitlist)
    };

    // Get waitlist count
    public query func getWaitlistCount() : async Nat {
        waitlist.size()
    };

    // Check if email is in waitlist
    public query func isEmailInWaitlist(email: Text) : async Bool {
        let entries = Buffer.toArray(waitlist);
        switch (Array.find<WaitlistEntry>(entries, func(entry) = entry.email == email)) {
            case (?_) { true };
            case null { false };
        }
    };

    // Remove email from waitlist (admin function)
    public func removeFromWaitlist(email: Text) : async Result<Text, Text> {
        let entries = Buffer.toArray(waitlist);
        let filteredEntries = Array.filter<WaitlistEntry>(entries, func(entry) = entry.email != email);
        
        if (entries.size() == filteredEntries.size()) {
            return #err("Email not found in waitlist");
        };

        waitlist := Buffer.fromArray(filteredEntries);
        #ok("Successfully removed from waitlist")
    };

    // Basic email validation function
    private func isValidEmail(email: Text) : Bool {
        let emailText = Text.toLowercase(email);
        Text.contains(emailText, #char '@') and Text.size(emailText) > 5
    };

    // Get waitlist entries by date range (admin function)
    public query func getWaitlistEntriesByDateRange(startTime: Int, endTime: Int) : async [WaitlistEntry] {
        let entries = Buffer.toArray(waitlist);
        Array.filter<WaitlistEntry>(entries, func(entry) = entry.timestamp >= startTime and entry.timestamp <= endTime)
    };

    // Export waitlist data (admin function)
    public query func exportWaitlistData() : async Text {
        let entries = Buffer.toArray(waitlist);
        var csvData = "Email,Timestamp,Date\n";
        
        for (entry in entries.vals()) {
            let dateStr = Int.toText(entry.timestamp);
            csvData := csvData # entry.email # "," # Int.toText(entry.timestamp) # "," # dateStr # "\n";
        };
        
        csvData
    };
}