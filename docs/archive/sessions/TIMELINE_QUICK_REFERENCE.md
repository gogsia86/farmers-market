# 🎯 NSIGHT TIMELINE VIEW - QUICK REFERENCE

## ✅ STATUS: READY TO ANALYZE

**Profile:** `test_wddm.nsys-rep` (73.48 MB)
**Tests:** 2,000 with open handle detection
**Viewer:** Nsight Systems UI (OPEN)

---

## 🖱️ MOUSE CONTROLS

| Action           | Result                    |
| ---------------- | ------------------------- |
| **Click + Drag** | Pan timeline horizontally |
| **Mouse Wheel**  | Zoom in/out at cursor     |
| **Double Click** | Zoom to selection         |
| **Right Click**  | Context menu              |
| **Hover**        | Show details tooltip      |

---

## ⌨️ KEYBOARD SHORTCUTS

| Keys         | Action                 |
| ------------ | ---------------------- |
| `Ctrl + F`   | Search for test names  |
| `Home`       | Jump to timeline start |
| `End`        | Jump to timeline end   |
| `Ctrl + 0`   | Reset zoom to fit all  |
| `Ctrl + +/-` | Zoom in/out            |
| `Arrow Keys` | Pan timeline           |

---

## 🔍 WHAT TO LOOK FOR

### 1. Longest Bars = Slowest Tests

- **Target:** Find tests > 5 seconds
- **Action:** Click bar → Note test name

### 2. Gaps = Wasted Time

- **Target:** Minimize empty spaces
- **Action:** Identify cause of delays

### 3. Dense Activity = Good

- **Target:** Continuous CPU usage
- **Action:** Check context switch row

---

## 📊 VIEWS AVAILABLE

| View           | Purpose                            |
| -------------- | ---------------------------------- |
| **Timeline**   | See all operations chronologically |
| **Functions**  | Function call times sorted         |
| **Processes**  | Process/thread hierarchy           |
| **Statistics** | Summary metrics & charts           |

---

## 🎯 ANALYSIS STEPS

1. **Zoom Out** - See entire timeline
2. **Find Longest Bars** - Identify slowest tests
3. **Zoom In** - Examine details
4. **Document** - Note test names & times
5. **Export** - Save data for analysis

---

## 💾 EXPORT COMMANDS

```powershell
# Export to CSV
nsys export --type csv --output timeline.csv test_wddm.nsys-rep

# Generate statistics
nsys stats --report gputrace,osrt_sum test_wddm.nsys-rep
```

---

## 🎯 PERFORMANCE TARGETS

| Metric       | Target |
| ------------ | ------ |
| Total Time   | < 60s  |
| Avg per Test | < 30ms |
| Slowest Test | < 5s   |
| CPU Usage    | > 80%  |

---

## 📝 QUICK CHECKLIST

- [ ] Zoom to see full timeline
- [ ] Note total duration
- [ ] Find 10 longest bars
- [ ] Document test names
- [ ] Screenshot bottlenecks
- [ ] Export to CSV
- [ ] Create optimization list

---

**File:** `V:\Projects\Farmers-Market\profiling_output\test_wddm.nsys-rep`
