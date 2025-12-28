package vaultsync

import (
	"testing"
)

func TestSyncOurKeys(t *testing.T) {
	// Set stop condition to prevent actual operations
	setStopCondition(true)
	defer func() {
		setStopCondition(false)
	}()

	// This should not panic
	defer func() {
		if r := recover(); r != nil {
			t.Errorf("syncOurKeys panicked: %v", r)
		}
	}()

	syncOurKeys("SYNC_OUR_KEYS")
}

func TestSyncExternalKeys(t *testing.T) {
	// Set stop condition to prevent actual operations
	setStopCondition(true)
	defer func() {
		setStopCondition(false)
	}()

	// This should not panic
	defer func() {
		if r := recover(); r != nil {
			t.Errorf("syncExternalKeys panicked: %v", r)
		}
	}()

	syncExternalKeys("SYNC_EXTERNAL_KEYS")
}

func TestSyncKeys(t *testing.T) {
	// Set stop condition to prevent actual operations
	setStopCondition(true)
	defer func() {
		setStopCondition(false)
	}()

	testCases := []struct {
		keyLabel string
		action   string
	}{
		{"K4_AES", "SYNC_OUR_KEYS"},
		{"K4_DES", "SYNC_EXTERNAL_KEYS"},
		{"test_label", "UNKNOWN_ACTION"},
	}

	for _, tc := range testCases {
		t.Run(tc.keyLabel+"_"+tc.action, func(t *testing.T) {
			// Should not panic
			defer func() {
				if r := recover(); r != nil {
					t.Errorf("SyncKeys panicked: %v", r)
				}
			}()

			SyncKeys(tc.keyLabel, tc.action)
		})
	}
}

func TestSyncKeysMutexes(t *testing.T) {
	// Test that mutexes can be locked and unlocked
	SyncOurKeysMutex.Lock()
	SyncOurKeysMutex.Unlock()

	SyncExternalKeysMutex.Lock()
	SyncExternalKeysMutex.Unlock()

	SyncUserMutex.Lock()
	SyncUserMutex.Unlock()
}
