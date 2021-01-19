package backend

class Sudoku(val size: Int) {
    val arr = ArrayList<ArrayList<Int?>>(size)

    init {
        /*
            This gives:
            123456
            2
            3
            4
            5
            6
         */
        repeat(size) { i ->
            arr.add(ArrayList(size))
            repeat(size) { 
                arr[i].add(null)            
            }
            
            arr[i][0] = i
            arr[0][i] = i
        }
        
    }    

    fun validNumbers(i: Int, j: Int): Array<Int> {
        val inRow = arr[i].filterNotNull()
        val inCol = arr.filter { it[j] != null }.map{ it[j] }
        val ret = (0..size-1).minus(inRow).minus(inCol).filterNotNull()
        return ret.toTypedArray()
    }

    fun generate(startRow: Int = 0): Boolean {
        for (i in startRow..size-1) {
            for (j in 0..size-1) {
                if (arr[i][j] == null) {
                    val candidates = validNumbers(i, j)
                    candidates.shuffle()
                    for(candidate in candidates) {
                        arr[i][j] = candidate
                        if (generate(i))
                            return true
                    }

                    arr[i][j] = null
                    // No valid number can go here - back out
                    return false
                }
            }
        }

        return true
    }

    fun print() {
        for(subArr in arr){
            for(v in subArr)
                print(v)
            
            println()
        }
    }
}
