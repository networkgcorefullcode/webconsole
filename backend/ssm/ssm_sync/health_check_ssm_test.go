package ssmsync

import (
	"testing"
)

func TestHealthMutexInitialized(t *testing.T) {
	// Test that healthMutex is initialized and can be locked/unlocked
	healthMutex.Lock()
	healthMutex.Unlock()
}

func TestStopSSMsyncFunctionGlobal(t *testing.T) {
	// Test that the global variable can be accessed
	originalValue := StopSSMsyncFunction

	StopSSMsyncFunction = true
	if !StopSSMsyncFunction {
		t.Error("StopSSMsyncFunction should be true")
	}

	StopSSMsyncFunction = false
	if StopSSMsyncFunction {
		t.Error("StopSSMsyncFunction should be false")
	}

	// Restore original value
	StopSSMsyncFunction = originalValue
}
